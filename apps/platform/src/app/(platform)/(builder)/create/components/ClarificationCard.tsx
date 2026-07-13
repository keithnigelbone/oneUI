'use client';

import { useState, useCallback } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Input } from '@oneui/ui/components/Input';
import { Toggle } from '@oneui/ui/components/Toggle';
import { OFFLINE_MULTI_ANSWER_JOIN } from '../lib/offline-constants';
import styles from './ClarificationCard.module.css';

export interface ClarificationQuestion {
  id: string;
  prompt: string;
  options?: string[];
  allowFreeText?: boolean;
  /** When true with options, user can select multiple chips (joined for submit). */
  allowMultiple?: boolean;
}

interface ClarificationCardProps {
  questions: ClarificationQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
}

export function ClarificationCard({ questions, onSubmit }: ClarificationCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelections, setMultiSelections] = useState<Record<string, Set<string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleMulti = useCallback((id: string, opt: string, pressed: boolean) => {
    setMultiSelections((prev) => {
      const cur = new Set(prev[id] ?? []);
      if (pressed) cur.add(opt);
      else cur.delete(opt);
      return { ...prev, [id]: cur };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    const payload = { ...answers };
    for (const q of questions) {
      if (q.allowMultiple && q.options && q.options.length > 0) {
        const set = multiSelections[q.id] ?? new Set<string>();
        payload[q.id] = Array.from(set).join(OFFLINE_MULTI_ANSWER_JOIN);
      }
    }
    onSubmit(payload);
  }, [answers, multiSelections, onSubmit, questions, submitted]);

  if (submitted) {
    return null;
  }

  return (
    <div className={styles.card}>
      <p className={styles.title}>Help us narrow this down</p>
      {questions.map((q) => (
        <div key={q.id} className={styles.question}>
          <label className={styles.qLabel}>{q.prompt}</label>
          {q.options && q.options.length > 0 ? (
            <div className={styles.chips}>
              {q.options.map((opt) => (
                <Toggle
                  key={opt}
                  pressed={
                    q.allowMultiple
                      ? (multiSelections[q.id]?.has(opt) ?? false)
                      : answers[q.id] === opt
                  }
                  onPressedChange={(pressed) =>
                    q.allowMultiple
                      ? toggleMulti(q.id, opt, pressed)
                      : setAnswer(q.id, pressed ? opt : '')
                  }
                  size="small"
                >
                  {opt}
                </Toggle>
              ))}
            </div>
          ) : (
            <Input
              className={styles.textInput}
              value={answers[q.id] ?? ''}
              onChange={(value) => setAnswer(q.id, value)}
              placeholder="Your answer"
            />
          )}
          {q.allowFreeText && q.options && q.options.length > 0 ? (
            <Input
              className={`${styles.textInput} ${styles.extraInput}`}
              value={answers[`${q.id}_extra`] ?? ''}
              onChange={(value) => setAnswer(`${q.id}_extra`, value)}
              placeholder="Additional details (optional)"
            />
          ) : null}
        </div>
      ))}
      <div className={styles.actions}>
        <Button attention="high" onPress={handleSubmit}>
          Submit answers
        </Button>
      </div>
    </div>
  );
}
