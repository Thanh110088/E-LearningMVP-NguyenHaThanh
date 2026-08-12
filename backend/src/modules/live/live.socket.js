const prisma = require("../../config/prisma");

const rooms = new Map();

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setupLiveSockets(io) {
  io.on("connection", (socket) => {
    console.log(`⚡ Live Socket Client connected: ${socket.id}`);

    // --- HOST EVENTS ---
    socket.on("host:create_room", async ({ examId, userId }) => {
      try {
        const exam = await prisma.exam.findUnique({
          where: { id: examId },
          include: {
            questions: {
              include: {
                options: true,
              },
            },
            subject: true,
            grade: true,
          },
        });

        if (!exam) {
          return socket.emit("host:error", { message: "Không tìm thấy bài thi" });
        }

        let pinCode = exam.pinCode;
        if (!pinCode) {
          pinCode = generatePin();
          await prisma.exam.update({
            where: { id: examId },
            data: { pinCode, isLive: true },
          });
        }

        let room = rooms.get(pinCode);
        if (!room) {
          room = {
            pinCode,
            examId: exam.id,
            examTitle: exam.title,
            questions: exam.questions,
            hostSocketId: socket.id,
            status: "LOBBY",
            startedAt: null,
            players: new Map(),
          };
          rooms.set(pinCode, room);
        } else {
          room.hostSocketId = socket.id;
          if (room.status === "FINISHED") {
            room.status = "LOBBY";
            room.players.clear();
          }
        }

        socket.join(`room:${pinCode}`);

        const sanitizedQuestions = room.questions.map((q) => ({
          id: q.id,
          content: q.content,
          difficulty: q.difficulty,
          points: q.points,
          options: q.options.map((o) => ({ id: o.id, content: o.content })),
        }));

        socket.emit("host:room_created", {
          pinCode,
          examTitle: exam.title,
          totalQuestions: exam.questions.length,
          status: room.status,
          questions: sanitizedQuestions,
          players: Array.from(room.players.values()).map((p) => ({
            socketId: p.socketId,
            playerName: p.playerName,
            score: p.score,
            correctAnswers: p.correctAnswers,
            totalAnswered: p.answeredQuestionIds.size,
            streak: p.streak,
          })),
        });
      } catch (err) {
        console.error("Error creating live room:", err);
        socket.emit("host:error", { message: "Lỗi hệ thống khi tạo phòng live" });
      }
    });

    socket.on("host:reset_room", async ({ pinCode }) => {
      try {
        const oldRoom = rooms.get(pinCode);
        if (!oldRoom) return socket.emit("host:error", { message: "Phòng không tồn tại" });

        const newPin = generatePin();
        await prisma.exam.update({
          where: { id: oldRoom.examId },
          data: { pinCode: newPin, isLive: true },
        });

        rooms.delete(pinCode);

        const newRoom = {
          pinCode: newPin,
          examId: oldRoom.examId,
          examTitle: oldRoom.examTitle,
          questions: oldRoom.questions,
          hostSocketId: socket.id,
          status: "LOBBY",
          startedAt: null,
          players: new Map(),
        };

        rooms.set(newPin, newRoom);

        io.to(`room:${pinCode}`).emit("quiz:reset", { newPin });

        socket.leave(`room:${pinCode}`);
        socket.join(`room:${newPin}`);

        const sanitizedQuestions = newRoom.questions.map((q) => ({
          id: q.id,
          content: q.content,
          difficulty: q.difficulty,
          points: q.points,
          options: q.options.map((o) => ({ id: o.id, content: o.content })),
        }));

        socket.emit("host:room_created", {
          pinCode: newPin,
          examTitle: newRoom.examTitle,
          totalQuestions: newRoom.questions.length,
          status: "LOBBY",
          questions: sanitizedQuestions,
          players: [],
        });
      } catch (err) {
        console.error("Error resetting live room:", err);
        socket.emit("host:error", { message: "Không thể làm mới phòng thi" });
      }
    });

    socket.on("host:start_quiz", ({ pinCode }) => {
      const room = rooms.get(pinCode);
      if (!room) return socket.emit("host:error", { message: "Phòng không tồn tại" });

      room.status = "IN_PROGRESS";
      room.startedAt = new Date();

      const sanitizedQuestions = room.questions.map((q) => ({
        id: q.id,
        content: q.content,
        difficulty: q.difficulty,
        points: q.points,
        options: q.options.map((o) => ({ id: o.id, content: o.content })),
      }));

      io.to(`room:${pinCode}`).emit("quiz:started", {
        pinCode,
        examTitle: room.examTitle,
        totalQuestions: room.questions.length,
        questions: sanitizedQuestions,
      });
    });

    socket.on("host:end_quiz", ({ pinCode }) => {
      const room = rooms.get(pinCode);
      if (!room) return;

      room.status = "FINISHED";
      const leaderboard = getLeaderboard(room);

      io.to(`room:${pinCode}`).emit("quiz:ended", {
        pinCode,
        leaderboard,
        podium: leaderboard.slice(0, 3),
      });
    });

    socket.on("host:get_room_state", ({ pinCode }) => {
      const room = rooms.get(pinCode);
      if (!room) return socket.emit("host:error", { message: "Phòng không tồn tại" });

      socket.emit("host:room_state", {
        pinCode,
        examTitle: room.examTitle,
        totalQuestions: room.questions.length,
        status: room.status,
        players: Array.from(room.players.values()).map((p) => ({
          socketId: p.socketId,
          playerName: p.playerName,
          score: p.score,
          correctAnswers: p.correctAnswers,
          totalAnswered: p.answeredQuestionIds.size,
          streak: p.streak,
        })),
        leaderboard: getLeaderboard(room),
      });
    });

    // --- PLAYER EVENTS ---
    socket.on("player:join_room", async ({ pinCode, userId, playerName, avatarUrl }) => {
      if (!pinCode) return socket.emit("player:join_error", { message: "Mã PIN không hợp lệ" });

      const cleanedPin = pinCode.toString().trim();
      let room = rooms.get(cleanedPin);

      // Restore room from DB if not in memory
      if (!room) {
        try {
          const exam = await prisma.exam.findFirst({
            where: {
              status: "PUBLISHED",
              OR: [
                { pinCode: cleanedPin },
                { code: cleanedPin },
                { code: { equals: `EXAM-${cleanedPin}`, mode: "insensitive" } },
                { code: { contains: cleanedPin, mode: "insensitive" } },
              ],
            },
            include: {
              questions: { include: { options: true } },
            },
          });

          if (exam) {
            room = {
              pinCode: exam.pinCode || cleanedPin,
              examId: exam.id,
              examTitle: exam.title,
              questions: exam.questions,
              hostSocketId: null,
              status: "LOBBY",
              startedAt: null,
              players: new Map(),
            };
            rooms.set(cleanedPin, room);
          }
        } catch (err) {
          console.error("Error restoring room:", err);
        }
      }

      if (!room) {
        return socket.emit("player:join_error", { message: "Mã PIN không hợp lệ hoặc phòng chưa mở" });
      }

      socket.join(`room:${cleanedPin}`);

      const displayName = playerName || `Học sinh #${Math.floor(1000 + Math.random() * 9000)}`;

      let player = room.players.get(socket.id);
      if (!player) {
        player = {
          socketId: socket.id,
          userId: userId || null,
          playerName: displayName,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
          score: 0,
          correctAnswers: 0,
          streak: 0,
          answeredQuestionIds: new Set(),
          answers: {},
        };
        room.players.set(socket.id, player);
      }

      const sanitizedQuestions = room.questions.map((q) => ({
        id: q.id,
        content: q.content,
        difficulty: q.difficulty,
        points: q.points,
        options: q.options.map((o) => ({ id: o.id, content: o.content })),
      }));

      socket.emit("player:join_success", {
        pinCode: cleanedPin,
        examTitle: room.examTitle,
        totalQuestions: room.questions.length,
        status: room.status,
        player: {
          playerName: player.playerName,
          score: player.score,
          correctAnswers: player.correctAnswers,
          answeredCount: player.answeredQuestionIds.size,
        },
        questions: sanitizedQuestions,
      });

      // Broadcast updated players list
      io.to(`room:${cleanedPin}`).emit("room:players_updated", {
        players: Array.from(room.players.values()).map((p) => ({
          socketId: p.socketId,
          playerName: p.playerName,
          score: p.score,
          avatarUrl: p.avatarUrl,
        })),
        totalPlayers: room.players.size,
      });

      // Send live leaderboard
      io.to(`room:${cleanedPin}`).emit("room:leaderboard_updated", {
        leaderboard: getLeaderboard(room),
        totalQuestions: room.questions.length,
      });
    });

    socket.on("player:submit_answer", ({ pinCode, questionId, selectedOptionId, timeSpentSeconds }) => {
      const cleanedPin = (pinCode || "").toString().trim();
      const room = rooms.get(cleanedPin);
      if (!room) return socket.emit("player:error", { message: "Phòng thi không tồn tại" });

      const player = room.players.get(socket.id);
      if (!player) return socket.emit("player:error", { message: "Bạn chưa tham gia phòng thi" });

      if (player.answeredQuestionIds.has(questionId)) {
        return socket.emit("player:error", { message: "Bạn đã trả lời câu hỏi này rồi" });
      }

      const question = room.questions.find((q) => q.id === questionId);
      if (!question) return socket.emit("player:error", { message: "Câu hỏi không hợp lệ" });

      const selectedOption = question.options.find((o) => o.id === selectedOptionId);
      const isCorrect = selectedOption ? selectedOption.isCorrect : false;

      let pointsEarned = 0;
      if (isCorrect) {
        const basePoints = Math.round((question.points || 1.0) * 1000);
        const timeLimit = 30; // seconds per question default
        const speedBonusRatio = Math.max(0.5, 1 - Math.min(timeSpentSeconds || 5, timeLimit) / (timeLimit * 2));
        
        player.streak += 1;
        const streakBonus = player.streak > 1 ? (player.streak - 1) * 100 : 0;
        pointsEarned = Math.round(basePoints * speedBonusRatio + streakBonus);

        player.score += pointsEarned;
        player.correctAnswers += 1;
      } else {
        player.streak = 0;
      }

      player.answeredQuestionIds.add(questionId);
      player.answers[questionId] = { selectedOptionId, isCorrect, pointsEarned };

      // Find player rank in leaderboard
      const leaderboard = getLeaderboard(room);
      const currentRank = leaderboard.findIndex((p) => p.socketId === socket.id) + 1;

      socket.emit("player:answer_feedback", {
        questionId,
        isCorrect,
        correctOptionId: question.options.find((o) => o.isCorrect)?.id,
        pointsEarned,
        totalScore: player.score,
        streak: player.streak,
        currentRank,
        totalPlayers: room.players.size,
        isCompleted: player.answeredQuestionIds.size >= room.questions.length,
      });

      // REALTIME LEADERBOARD EVENT TO ALL IN ROOM
      io.to(`room:${cleanedPin}`).emit("room:leaderboard_updated", {
        leaderboard,
        totalQuestions: room.questions.length,
      });
    });

    socket.on("disconnect", () => {
      rooms.forEach((room, pinCode) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          io.to(`room:${pinCode}`).emit("room:players_updated", {
            players: Array.from(room.players.values()).map((p) => ({
              socketId: p.socketId,
              playerName: p.playerName,
              score: p.score,
              avatarUrl: p.avatarUrl,
            })),
            totalPlayers: room.players.size,
          });
          io.to(`room:${pinCode}`).emit("room:leaderboard_updated", {
            leaderboard: getLeaderboard(room),
            totalQuestions: room.questions.length,
          });
        }
      });
    });
  });
}

function getLeaderboard(room) {
  return Array.from(room.players.values())
    .map((p) => ({
      socketId: p.socketId,
      userId: p.userId,
      playerName: p.playerName,
      score: p.score,
      correctAnswers: p.correctAnswers,
      totalAnswered: p.answeredQuestionIds.size,
      totalQuestions: room.questions.length,
      streak: p.streak,
      avatarUrl: p.avatarUrl,
      isCompleted: p.answeredQuestionIds.size >= room.questions.length,
    }))
    .sort((a, b) => b.score - a.score || b.correctAnswers - a.correctAnswers);
}

module.exports = {
  setupLiveSockets,
};
