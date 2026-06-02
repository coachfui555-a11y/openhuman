import React, { useEffect, useState } from 'react';
import { useCoreRpc } from '../utils/useCoreRpc';

type Question = {
  id: string;
  text: string;
  type: 'single' | 'multi' | 'text';
  options?: string[];
  tags?: string[];
  explanation?: string;
};

export default function ExamHelper() {
  const { call } = useCoreRpc();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | string[]>('');
  const [results, setResults] = useState<Record<string, { correct: boolean; correctAnswer?: any }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    call('exam.list', { limit: 20 }).then((res) => {
      setQuestions(res);
    }).catch(console.error).finally(() => setLoading(false));
  }, [call]);

  if (loading) return <div>加载中…</div>;
  if (questions.length === 0) return <div>没有题目（试试导入或更改筛选）</div>;

  const q = questions[index];

  function submit() {
    const answer = selected;
    call('exam.submitAnswer', { id: q.id, answer }).then((r: any) => {
      setResults((s) => ({ ...s, [q.id]: r }));
      // 自动跳到下一题
      setIndex((i) => Math.min(i + 1, questions.length - 1));
      setSelected('');
    }).catch(console.error);
  }

  return (
    <div>
      <h2>练习 — 题目 {index + 1}/{questions.length}</h2>
      <div style={{ marginBottom: 12 }}>{q.text}</div>
      {q.options?.map((opt, i) => (
        <label key={i} style={{ display: 'block', marginBottom: 6 }}>
          <input
            type={q.type === 'multi' ? 'checkbox' : 'radio'}
            name="opt"
            value={opt}
            checked={Array.isArray(selected) ? (selected as string[]).includes(opt) : selected === opt}
            onChange={(e) => {
              if (q.type === 'multi') {
                const arr = Array.isArray(selected) ? [...selected] as string[] : [];
                if (e.currentTarget.checked) arr.push(opt); else {
                  const idx = arr.indexOf(opt);
                  if (idx >= 0) arr.splice(idx, 1);
                }
                setSelected(arr);
              } else {
                setSelected(opt);
              }
            }}
          />
          {' '}
          {opt}
        </label>
      ))}
      {q.type === 'text' && (
        <textarea value={selected as string} onChange={(e) => setSelected(e.target.value)} />
      )}
      <div style={{ marginTop: 12 }}>
        <button onClick={submit}>提交</button>
        <button onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}>上题</button>
        <button onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))} disabled={index === questions.length - 1}>下题</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>已答统计</h3>
        <div>已答题数：{Object.keys(results).length}</div>
        <div>正确数：{Object.values(results).filter(r => r.correct).length}</div>
      </div>
    </div>
  );
}
