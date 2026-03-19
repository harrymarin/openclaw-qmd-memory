import crypto from "node:crypto";

import { trimText } from "./helpers.js";

function normalizeWhitespace(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

export function extractTextParts(content) {
  if (typeof content === "string") {
    return [normalizeWhitespace(content)].filter(Boolean);
  }
  if (Array.isArray(content)) {
    return content
      .flatMap((part) => {
        if (typeof part === "string") return [normalizeWhitespace(part)];
        if (part && typeof part === "object") {
          if (typeof part.text === "string") return [normalizeWhitespace(part.text)];
          if (typeof part.content === "string") return [normalizeWhitespace(part.content)];
        }
        return [];
      })
      .filter(Boolean);
  }
  if (content && typeof content === "object") {
    if (typeof content.text === "string") return [normalizeWhitespace(content.text)].filter(Boolean);
  }
  return [];
}

export function extractConversation(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      const role = typeof message?.role === "string" ? message.role : "unknown";
      const parts = extractTextParts(message?.content);
      const text = normalizeWhitespace(parts.join("\n"));
      return { role, text };
    })
    .filter((entry) => entry.text);
}

function splitSentences(text) {
  return normalizeWhitespace(text)
    .split(/(?<=[。！？!?\.])\s+|\n+/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);
}

function sentencePriority(sentence) {
  const s = sentence.toLowerCase();
  let score = 0;
  if (/(必须|绝对|严禁|不要|别再|以后|优先|记住|规则|流程|默认|只用|禁止)/.test(sentence)) score += 50;
  if (/(prefer|always|never|must|important|remember|default|avoid|rule)/.test(s)) score += 35;
  if (/(我喜欢|我不喜欢|我希望|我的|用户要|马哥|本机|local first)/.test(sentence)) score += 20;
  if (sentence.length > 30) score += 5;
  return score;
}

function detectCategory(sentence) {
  if (/(必须|不要|别再|严禁|优先|流程|规则|默认|只用|禁止)/.test(sentence)) return "decision";
  if (/(喜欢|不喜欢|希望|口吻|风格|审美|偏好|prefer|hate|love|want)/i.test(sentence)) return "preference";
  if (/(教训|下次|后续|踩坑|正确流程|复盘|避免|lesson)/i.test(sentence)) return "lesson";
  return "fact";
}

function derivePriority(category, sentence, sessionSuccess) {
  let priority = sentencePriority(sentence);
  if (category === "decision") priority += 25;
  if (category === "preference") priority += 20;
  if (category === "lesson") priority += 10;
  if (sessionSuccess === false && category === "lesson") priority += 15;
  return Math.min(100, Math.max(1, priority));
}

export function deriveTier(priority) {
  if (priority >= 80) return "hot";
  if (priority >= 45) return "warm";
  return "cold";
}

export function ttlDaysForTier(tier) {
  if (tier === "hot") return 180;
  if (tier === "warm") return 60;
  return 14;
}

export function fingerprintForSummary(summary) {
  return crypto.createHash("sha1").update(normalizeWhitespace(summary).toLowerCase()).digest("hex").slice(0, 12);
}

export function buildMemoryCandidates(messages, options = {}) {
  const conversation = extractConversation(messages);
  if (conversation.length === 0) return [];

  const sessionSuccess = options.sessionSuccess !== false;
  const lastUser = [...conversation].reverse().find((entry) => entry.role === "user")?.text ?? "";
  const lastAssistant = [...conversation].reverse().find((entry) => entry.role === "assistant")?.text ?? "";
  const candidateSentences = [
    ...splitSentences(lastUser),
    ...splitSentences(lastAssistant),
  ];

  const filtered = candidateSentences
    .filter((sentence) => sentencePriority(sentence) >= 25)
    .slice(0, 8);

  const seen = new Set();
  return filtered
    .map((sentence) => {
      const summary = trimText(sentence, 220);
      const category = detectCategory(summary);
      const priority = derivePriority(category, summary, sessionSuccess);
      const tier = deriveTier(priority);
      const fingerprint = fingerprintForSummary(summary);
      return {
        fingerprint,
        summary,
        category,
        priority,
        tier,
        ttlDays: ttlDaysForTier(tier),
        source: {
          user: trimText(lastUser, 280),
          assistant: trimText(lastAssistant, 280),
        },
      };
    })
    .filter((entry) => {
      if (seen.has(entry.fingerprint)) return false;
      seen.add(entry.fingerprint);
      return true;
    });
}
