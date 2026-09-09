# 🎮 HƯỚNG DẪN TỰ XÂY DỰNG CHỨC NĂNG THI ĐẤU LIVE REALTIME (KAHOOT / QUIZIZZ STYLE)

> **Mục đích tài liệu:** Tài liệu này tổng hợp toàn bộ kiến trúc, luồng hoạt động WebSocket (Socket.IO), công thức tính điểm tốc độ (Gamification) và code mẫu hoàn chỉnh từ nút **"Thi Live"** trong dự án để bạn dễ dàng học tập, sao chép và tái sử dụng.

---

## 🕹️ 1. TỔNG QUAN KIẾN TRÚC & LUỒNG TRÒ CHƠI (GAME LOOP)

Hệ thống **Thi Live (Đấu Quiz Thời Gian Thực)** hoạt động theo mô hình **Host - Room - Player** quản lý trạng thái (State Machine):

```
       [ GIÁO VIÊN / HOST ]                             [ HỌC SINH / PLAYERS ]
                │                                                  │
 1. Bấm "Thi Live" ──> Sinh mã PIN 6 số                            │
    (VD: PIN 839201)                                               │
                │                                                  │
 2. Phòng chờ LOBBY ◄── 3. Nhập mã PIN & Tên vào phòng ────────────┘
    (Hiện avatar, tên)                                             │
                │                                                  │
 4. Bấm "BẮT ĐẦU" ──── (Socket: `quiz:started`) ─────────────────►│
                │                                                  │
                │                                    5. Nhận câu hỏi & 4 ô màu
                │                                    6. Chọn đáp án cực nhanh
                │                                                  │
 7. BẢNG XẾP HẠNG ◄─── (Socket: `player:submit_answer`) ───────────┘
    Cập nhật Real-Time:                                            │
    - Điểm tốc độ (Speed)                                          │
    - Chuỗi đúng (Streak)                                          │
                │                                                  │
 8. Bấm "KẾT THÚC" ─── (Socket: `quiz:ended`) ────────────────────►│
                │                                                  │
 9. Bục Vinh Danh PODIUM (Top 1 🥇, Top 2 🥈, Top 3 🥉) ────────────┘
```

---

## ⚡ 2. CÔNG THỨC TÍNH ĐIỂM GAMIFICATION (SPEED + STREAK)

Để tạo cảm giác kịch tính như Kahoot/Quizizz, điểm số mỗi câu được tính dựa trên **độ chính xác**, **tốc độ trả lời** và **chuỗi câu đúng liên tiếp**:

$$\text{Điểm nhận được} = \text{Điểm Cơ Bản} \times \text{Hệ Số Tốc Độ} + \text{Thưởng Chuỗi (Streak)}$$

```javascript
function calculateScore(question, selectedOption, timeSpentSeconds, currentStreak) {
  const isCorrect = selectedOption?.isCorrect;
  if (!isCorrect) {
    return { points: 0, newStreak: 0 };
  }

  // 1. Điểm cơ bản (Ví dụ: 1000 điểm / câu)
  const basePoints = Math.round((question.points || 1.0) * 1000);
  const timeLimit = 30; // Giới hạn 30 giây / câu

  // 2. Hệ số tốc độ (Trả lời càng nhanh càng gần 1.0, trả lời ở giây cuối còn 0.5)
  const speedBonusRatio = Math.max(
    0.5, 
    1 - Math.min(timeSpentSeconds || 5, timeLimit) / (timeLimit * 2)
  );

  // 3. Thưởng chuỗi đúng liên tiếp (Streak: đúng từ câu thứ 2 trở đi được +100 điểm mỗi câu)
  const newStreak = currentStreak + 1;
  const streakBonus = newStreak > 1 ? (newStreak - 1) * 100 : 0;

  const pointsEarned = Math.round(basePoints * speedBonusRatio + streakBonus);

  return { points: pointsEarned, newStreak };
}
```

---

## 💻 3. CODE BACKEND: SOCKET.IO GAME ENGINE (`live.socket.js`)

Phần Backend sử dụng `Map` trong RAM để truy xuất phòng thi siêu tốc (độ trễ dưới **10ms**):

```javascript
// backend/src/modules/live/live.socket.js
const rooms = new Map(); // Lưu trữ các phòng đang mở trong RAM

// Hàm sinh mã PIN 6 số ngẫu nhiên
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setupLiveSockets(io) {
  io.on("connection", (socket) => {

    // ──────────────── 1. HOST: TẠO PHÒNG THI ────────────────
    socket.on("host:create_room", async ({ examId }) => {
      const pinCode = generatePin();
      
      const room = {
        pinCode,
        examId,
        status: "LOBBY", // LOBBY -> IN_PROGRESS -> FINISHED
        hostSocketId: socket.id,
        players: new Map(), // socketId -> playerData
      };

      rooms.set(pinCode, room);
      socket.join(`room:${pinCode}`);

      socket.emit("host:room_created", {
        pinCode,
        status: room.status,
        players: [],
      });
    });

    // ──────────────── 2. PLAYER: THAM GIA PHÒNG ────────────────
    socket.on("player:join_room", ({ pinCode, playerName }) => {
      const room = rooms.get(pinCode.trim());
      if (!room) {
        return socket.emit("player:join_error", { message: "Mã PIN không tồn tại hoặc phòng chưa mở" });
      }

      socket.join(`room:${pinCode}`);

      const player = {
        socketId: socket.id,
        playerName: playerName || `Học sinh #${Math.floor(1000 + Math.random() * 9000)}`,
        score: 0,
        streak: 0,
        answeredQuestionIds: new Set(),
      };

      room.players.set(socket.id, player);

      // Thông báo cho người chơi vào phòng thành công
      socket.emit("player:join_success", { pinCode, player });

      // Phát thông báo cho TOÀN PHÒNG danh sách người chơi mới
      io.to(`room:${pinCode}`).emit("room:players_updated", {
        players: Array.from(room.players.values()),
        totalPlayers: room.players.size,
      });
    });

    // ──────────────── 3. HOST: BẮT ĐẦU TRẬN ĐẤU ────────────────
    socket.on("host:start_quiz", ({ pinCode }) => {
      const room = rooms.get(pinCode);
      if (!room) return;

      room.status = "IN_PROGRESS";
      io.to(`room:${pinCode}`).emit("quiz:started", { pinCode });
    });

    // ──────────────── 4. PLAYER: NỘP CÂU TRẢ LỜI ────────────────
    socket.on("player:submit_answer", ({ pinCode, questionId, isCorrect, timeSpentSeconds }) => {
      const room = rooms.get(pinCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player || player.answeredQuestionIds.has(questionId)) return;

      let pointsEarned = 0;
      if (isCorrect) {
        player.streak += 1;
        pointsEarned = Math.round(1000 * Math.max(0.5, 1 - (timeSpentSeconds / 60)) + (player.streak - 1) * 100);
        player.score += pointsEarned;
      } else {
        player.streak = 0;
      }

      player.answeredQuestionIds.add(questionId);

      // Trả kết quả riêng cho người chơi đó
      socket.emit("player:answer_feedback", {
        isCorrect,
        pointsEarned,
        totalScore: player.score,
        streak: player.streak,
      });

      // Phát Bảng Xếp Hạng mới nhất cho TOÀN BỘ PHÒNG
      const leaderboard = Array.from(room.players.values())
        .sort((a, b) => b.score - a.score);

      io.to(`room:${pinCode}`).emit("room:leaderboard_updated", { leaderboard });
    });

    // ──────────────── 5. HOST: KẾT THÚC & VINH DANH PODIUM ────────────────
    socket.on("host:end_quiz", ({ pinCode }) => {
      const room = rooms.get(pinCode);
      if (!room) return;

      room.status = "FINISHED";
      const leaderboard = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
      const podium = leaderboard.slice(0, 3); // Top 1, 2, 3

      io.to(`room:${pinCode}`).emit("quiz:ended", { leaderboard, podium });
    });

    // ──────────────── 6. NGƯỜI CHƠI RỜI PHÒNG ────────────────
    socket.on("disconnect", () => {
      rooms.forEach((room, pinCode) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          io.to(`room:${pinCode}`).emit("room:players_updated", {
            players: Array.from(room.players.values()),
            totalPlayers: room.players.size,
          });
        }
      });
    });
  });
}

module.exports = { setupLiveSockets };
```

---

## 🖥️ 4. CODE FRONTEND: MÀN HÌNH GIÁO VIÊN HOST (`LiveHostDashboard.jsx`)

Component dành cho Giáo viên để chiếu lên màn hình máy chiếu cho cả lớp xem mã PIN và Bảng xếp hạng:

```jsx
import React, { useState, useEffect } from 'react';
import { socket } from '../../services/socket';

export const LiveHostDashboard = ({ examId, onBack }) => {
  const [pinCode, setPinCode] = useState('');
  const [status, setStatus] = useState('LOBBY'); // LOBBY | IN_PROGRESS | FINISHED
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);

  useEffect(() => {
    socket.connect();

    // 1. Gửi lệnh tạo phòng
    socket.emit("host:create_room", { examId });

    // 2. Lắng nghe tạo phòng thành công
    socket.on("host:room_created", (data) => {
      setPinCode(data.pinCode);
      setStatus(data.status);
    });

    // 3. Lắng nghe danh sách học sinh tham gia
    socket.on("room:players_updated", (data) => {
      setPlayers(data.players);
    });

    // 4. Lắng nghe bảng xếp hạng cập nhật
    socket.on("room:leaderboard_updated", (data) => {
      setLeaderboard(data.leaderboard);
    });

    // 5. Lắng nghe khi kết thúc thi đấu
    socket.on("quiz:ended", (data) => {
      setStatus('FINISHED');
      setPodium(data.podium);
    });

    return () => {
      socket.off("host:room_created");
      socket.off("room:players_updated");
      socket.off("room:leaderboard_updated");
      socket.off("quiz:ended");
    };
  }, [examId]);

  const handleStartQuiz = () => {
    socket.emit("host:start_quiz", { pinCode });
    setStatus('IN_PROGRESS');
  };

  const handleEndQuiz = () => {
    socket.emit("host:end_quiz", { pinCode });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* ── MÀN HÌNH 1: PHÒNG CHỜ (LOBBY) ── */}
      {status === 'LOBBY' && (
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <p className="text-slate-400 text-sm font-bold uppercase">Mã PIN Tham Gia Phòng Thi</p>
            <h1 className="text-7xl font-black tracking-widest text-cyan-400 font-mono animate-pulse">
              {pinCode || '...'}
            </h1>
            <p className="text-xs text-slate-500">Học sinh truy cập vào menu "Live PIN" và nhập mã số trên.</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">👥 Thí sinh đã vào: {players.length}</span>
            <button
              onClick={handleStartQuiz}
              disabled={players.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl font-black text-white hover:scale-105 transition disabled:opacity-50"
            >
              BẮT ĐẦU THI ĐẤU 🚀
            </button>
          </div>

          {/* Danh sách thẻ tên học sinh */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {players.map((p) => (
              <div key={p.socketId} className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-bold text-sm">
                {p.playerName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MÀN HÌNH 2: BẢNG XẾP HẠNG TRỰC TIẾP (IN_PROGRESS) ── */}
      {status === 'IN_PROGRESS' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-amber-400">🏆 BẢNG XẾP HẠNG LIVE</h2>
            <button onClick={handleEndQuiz} className="px-5 py-2 bg-rose-600 rounded-xl font-bold text-xs">
              KẾT THÚC BÀI THI
            </button>
          </div>

          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div
                key={player.socketId}
                className={`p-4 rounded-2xl flex items-center justify-between font-bold border transition-all ${
                  index === 0
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-xl text-slate-400">#{index + 1}</span>
                  <span className="text-base">{player.playerName}</span>
                  {player.streak > 1 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-bounce">
                      🔥 {player.streak} Streak
                    </span>
                  )}
                </div>
                <span className="text-xl font-black font-mono">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MÀN HÌNH 3: BỤC VINH DANH PODIUM (FINISHED) ── */}
      {status === 'FINISHED' && (
        <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
          <h1 className="text-4xl font-black text-amber-400">🎉 CHÚC MỪNG CHIẾN THẮNG 🎉</h1>

          {/* Podium Top 3 */}
          <div className="grid grid-cols-3 gap-4 items-end pt-12">
            {/* Top 2 */}
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 h-48 flex flex-col justify-end">
              <span className="text-3xl">🥈</span>
              <p className="font-bold text-slate-200 mt-2">{podium[1]?.playerName || '—'}</p>
              <p className="text-xs text-slate-400">{podium[1]?.score || 0} pts</p>
            </div>
            {/* Top 1 */}
            <div className="p-6 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-2xl border-2 border-amber-400 h-64 flex flex-col justify-end shadow-2xl shadow-amber-500/20 scale-110">
              <span className="text-5xl animate-bounce">👑</span>
              <span className="text-3xl mt-1">🥇</span>
              <p className="font-black text-amber-300 text-lg mt-2">{podium[0]?.playerName || '—'}</p>
              <p className="text-sm text-amber-400 font-bold">{podium[0]?.score || 0} pts</p>
            </div>
            {/* Top 3 */}
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 h-40 flex flex-col justify-end">
              <span className="text-3xl">🥉</span>
              <p className="font-bold text-slate-200 mt-2">{podium[2]?.playerName || '—'}</p>
              <p className="text-xs text-slate-400">{podium[2]?.score || 0} pts</p>
            </div>
          </div>

          <button onClick={onBack} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold">
            ← Quay Lại Quản Lý Đề
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 📱 5. CODE FRONTEND: MÀN HÌNH HỌC SINH THI ĐẤU (`LiveRoomPage.jsx`)

Giao diện học sinh nhập PIN và bấm đáp án 4 ô màu siêu tốc:

```jsx
import React, { useState, useEffect } from 'react';
import { socket } from '../../services/socket';

const OPTION_COLORS = [
  'bg-rose-600 hover:bg-rose-500',
  'bg-blue-600 hover:bg-blue-500',
  'bg-amber-600 hover:bg-amber-500',
  'bg-emerald-600 hover:bg-emerald-500',
];

export const LiveRoomPage = () => {
  const [pinInput, setPinInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    socket.connect();

    socket.on("player:join_success", () => setIsJoined(true));
    socket.on("quiz:started", () => setIsStarted(true));
    socket.on("player:answer_feedback", (data) => {
      setFeedback(data);
      setStreak(data.streak);
    });

    return () => {
      socket.off("player:join_success");
      socket.off("quiz:started");
      socket.off("player:answer_feedback");
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    socket.emit("player:join_room", { pinCode: pinInput, playerName: nameInput });
  };

  const handleSelectOption = (optionId) => {
    socket.emit("player:submit_answer", {
      pinCode: pinInput,
      questionId: currentQuestion?.id,
      selectedOptionId: optionId,
      timeSpentSeconds: 4,
    });
  };

  if (!isJoined) {
    return (
      <form onSubmit={handleJoin} className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-center text-white">🎮 Nhập Mã PIN Phòng Thi</h2>
        <input
          type="text"
          placeholder="Mã PIN 6 số"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-2xl font-mono text-cyan-400 font-bold"
        />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold"
        />
        <button type="submit" className="w-full py-3.5 bg-cyan-500 rounded-2xl font-black text-white hover:bg-cyan-400">
          VÀO PHÒNG THI
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center space-y-6">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>PIN: <strong>{pinInput}</strong></span>
        {streak > 1 && <span className="text-rose-400 font-bold">🔥 {streak} Streak</span>}
      </div>

      {/* 4 ô màu đáp án */}
      <div className="grid grid-cols-2 gap-4 pt-8">
        {['A', 'B', 'C', 'D'].map((label, idx) => (
          <button
            key={label}
            onClick={() => handleSelectOption(label)}
            className={`h-32 rounded-3xl font-black text-3xl text-white shadow-lg transition active:scale-95 ${OPTION_COLORS[idx]}`}
          >
            {label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl font-bold text-lg animate-bounce ${
          feedback.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
        }`}>
          {feedback.isCorrect ? `✓ CHÍNH XÁC (+${feedback.pointsEarned} pts)` : '✗ SAI MẤT RỒI!'}
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 6. TÓM TẮT SO SÁNH GIỮA 2 CHẾ ĐỘ TRONG DỰ ÁN

| Tiêu Chí | 🛡️ Thi Giám Sát Trực Tuyến (`TakeExamPage`) | 🎮 Thi Đấu Live Kahoot/Quizizz (`LiveHostDashboard`) |
| :--- | :--- | :--- |
| **Mục đích** | Thi học kỳ, thi thử THPT, kiểm tra chính thức | Thi đấu trên lớp, khởi động, ôn tập nhanh |
| **Thời gian làm bài** | Thí sinh tự do làm theo thời gian tổng (vd: 45 phút) | Đồng bộ theo từng câu hỏi / đếm ngược thời gian |
| **Chống gian lận** | Khóa Fullscreen, cấm chuột phải/copy/F12, bắt rời tab | Không bắt buộc, tập trung vào yếu tố tốc độ |
| **Tính điểm** | Điểm số theo barem đề thi (0 - 10 điểm) | Điểm tốc độ + Thưởng chuỗi liên tiếp (Streak) |
| **Kết quả** | Nộp bài xong mới xem bảng điểm & phân tích đúng/sai | Biết kết quả & thứ hạng nhảy ngay sau mỗi câu hỏi |
