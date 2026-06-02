use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: String,
    pub text: String,
    #[serde(rename = "type")]
    pub qtype: String, // "single" | "multi" | "text"
    pub options: Option<Vec<String>>,
    pub answer: Option<Value>, // keep as Value; do not expose to frontend
    pub explanation: Option<String>,
    pub tags: Option<Vec<String>>,
}

pub struct ExamService {
    // In real core: replace with DB / persistent store
    pub questions: HashMap<String, Question>,
}

impl ExamService {
    pub fn new() -> Self {
        Self { questions: HashMap::new() }
    }

    pub fn register_sample(&mut self) {
        let q = Question {
            id: "q1".to_string(),
            text: "1 + 1 = ?".to_string(),
            qtype: "single".to_string(),
            options: Some(vec!["1".into(), "2".into(), "3".into()]),
            answer: Some(Value::String("2".into())),
            explanation: Some("1 + 1 = 2".into()),
            tags: Some(vec!["math".into(), "easy".into()]),
        };
        self.questions.insert(q.id.clone(), q);
    }

    // 返回供前端展示的题目（不包含 answer 字段）
    pub fn list_questions(&self, limit: usize, offset: usize) -> Vec<Value> {
        self.questions.values()
            .skip(offset)
            .take(limit)
            .map(|q| {
                let mut v = serde_json::to_value(q).unwrap();
                if let Value::Object(ref mut map) = v {
                    map.remove("answer");
                }
                v
            }).collect()
    }

    pub fn submit_answer(&self, id: &str, answer: &Value) -> Option<Value> {
        self.questions.get(id).map(|q| {
            let correct = q.answer.as_ref().map_or(false, |a| a == answer);
            let mut res = serde_json::json!({ "correct": correct });
            if !correct {
                res["correctAnswer"] = q.answer.clone().unwrap_or(Value::Null);
            }
            if let Some(exp) = &q.explanation {
                res["explanation"] = Value::String(exp.clone());
            }
            res
        })
    }
}
