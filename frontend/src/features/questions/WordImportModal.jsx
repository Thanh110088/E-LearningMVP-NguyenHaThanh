import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Sparkles, Upload, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LaTeXRenderer } from '../../components/common/LaTeXRenderer';
import api from '../../lib/axios';

export const WordImportModal = ({ isOpen, onClose, onImportSuccess, examId = null, subjectId = null }) => {
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Regex Parser for Word / Text content
  const handleParse = () => {
    setError('');
    if (!rawText.trim()) {
      setError('Vui lòng nhập hoặc dán nội dung đề thi từ Word');
      return;
    }

    try {
      const blocks = rawText.split(/(?:Câu\s*\d+[\:.:]|\n(?=Câu\s*\d+))/gi).filter((b) => b.trim());
      const questions = [];

      blocks.forEach((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        let content = lines[0].replace(/^Câu\s*\d+[\:.:]/i, '').trim();
        const options = [];
        let correctAnswerIndex = 0;

        lines.slice(1).forEach((line) => {
          // Detect options A., B., C., D. or A), B)...
          const optMatch = line.match(/^([A-D])[\:.)]\s*(.*)/i);
          if (optMatch) {
            let optText = optMatch[2].trim();
            let isCorrect = false;

            // Check if marked with asterisk * or [x]
            if (optText.endsWith('*') || optText.startsWith('*')) {
              isCorrect = true;
              optText = optText.replace(/\*/g, '').trim();
            }

            options.push({
              content: optText,
              isCorrect,
            });

            if (isCorrect) {
              correctAnswerIndex = options.length - 1;
            }
          } else if (line.toLowerCase().startsWith('dáp án') || line.toLowerCase().startsWith('đáp án')) {
            // e.g. "Đáp án: A"
            const ansLetter = line.split(/[\:.]/)[1]?.trim()?.toUpperCase();
            if (ansLetter) {
              const letterIdx = ['A', 'B', 'C', 'D'].indexOf(ansLetter);
              if (letterIdx !== -1 && options[letterIdx]) {
                options.forEach((o, i) => (o.isCorrect = i === letterIdx));
              }
            }
          } else {
            // Append line to question content if options haven't started yet
            if (options.length === 0) {
              content += ' ' + line;
            }
          }
        });

        // Ensure at least 1 option marked correct
        if (options.length > 0 && !options.some((o) => o.isCorrect)) {
          options[0].isCorrect = true;
        }

        if (content && options.length >= 2) {
          questions.push({
            content,
            type: 'SINGLE_CHOICE',
            difficulty: 'MEDIUM',
            options,
          });
        }
      });

      if (questions.length === 0) {
        setError('Không bóc tách được câu hỏi nào. Vui lòng kiểm tra lại định dạng (Ví dụ: "Câu 1: ... A. ... B. ...")');
      } else {
        setParsedQuestions(questions);
      }
    } catch (err) {
      setError('Lỗi khi bóc tách văn bản: ' + err.message);
    }
  };

  const handleSaveImport = async () => {
    if (parsedQuestions.length === 0) return;
    setLoading(true);
    setError('');

    try {
      let createdCount = 0;
      for (const q of parsedQuestions) {
        await api.post('/questions', {
          content: q.content,
          type: q.type,
          difficulty: q.difficulty,
          points: 1.0,
          examId: examId || undefined,
          subjectId: subjectId || undefined,
          options: q.options,
        });
        createdCount++;
      }

      if (onImportSuccess) onImportSuccess(createdCount);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu câu hỏi vào hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const sampleText = `Câu 1: Hàm số $y = x^2$ đồng biến trên khoảng nào?
A. (-∞; 0)
B. (0; +∞)*
C. R
D. (-∞; +∞)

Câu 2: Công thức hóa học của nước là gì?
A. H2
B. O2
C. H2O*
D. CO2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">Import Đề Thi Từ Word (.docx / Text)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedQuestions.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase">
                  Dán Nội Dung Đề Thi Từ File Word Vào Đây
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(sampleText)}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Thử Mẫu Đề
                </button>
              </div>

              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Dán đề thi của bạn vào đây...\nVí dụ:\nCâu 1: Nội dung câu hỏi...\nA. Phương án A\nB. Phương án B*\nC. Phương án C\nD. Phương án D`}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 space-y-1">
                <p className="font-bold">💡 Mẹo định dạng từ Word:</p>
                <p>• Bắt đầu câu hỏi bằng <strong>Câu 1:</strong>, <strong>Câu 2:</strong>...</p>
                <p>• Các lựa chọn bắt đầu bằng <strong>A.</strong>, <strong>B.</strong>, <strong>C.</strong>, <strong>D.</strong></p>
                <p>• Đánh dấu đáp án đúng bằng cách thêm cờ <strong>*</strong> ở cuối phương án (Ví dụ: <code>B. Phương án B*</code>) hoặc thêm dòng <code>Đáp án: B</code> bên dưới.</p>
                <p>• Hỗ trợ công thức toán học dạng <code>$x^2$</code> hoặc <code>$\\frac{{a}}{{b}}$</code>.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã bóc tách thành công {parsedQuestions.length} câu hỏi
                </span>
                <button onClick={() => setParsedQuestions([])} className="text-xs text-slate-400 hover:text-cyan-400 underline">
                  Nhập lại
                </button>
              </div>

              {/* Preview Parsed Questions */}
              <div className="space-y-4">
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-cyan-400 shrink-0">Câu {idx + 1}:</span>
                      <div className="flex-1 font-semibold text-slate-100">
                        <LaTeXRenderer content={q.content} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            opt.isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-mono text-[10px] uppercase font-extrabold">{String.fromCharCode(65 + oIdx)}.</span>
                          <LaTeXRenderer content={opt.content} />
                          {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>

          {parsedQuestions.length === 0 ? (
            <Button
              variant="primary"
              onClick={handleParse}
              className="bg-gradient-to-r from-cyan-500 to-sky-600 font-bold border-0 px-6"
            >
              Bóc Tách Nội Dung <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSaveImport}
              loading={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 font-extrabold border-0 px-6"
            >
              Lưu {parsedQuestions.length} Câu Hỏi Vào Hệ Thống
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
