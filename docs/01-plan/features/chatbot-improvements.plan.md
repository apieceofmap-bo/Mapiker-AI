# Chatbot Improvements Plan

> **Summary**: 챗봇 대화 흐름 개선, 세일즈 연결, UX 향상
>
> **Author**: Claude Code
> **Date**: 2026-01-22
> **Status**: Planning (v1.1)
> **Parent Plan**: user-journey-enhancements.plan.md

---

## Features Overview

| # | Feature | 상태 | 우선순위 |
|---|---------|------|----------|
| 1 | [Sales Team Connection](#feature-1-sales-team-connection) | Planning | P1 |
| 2 | [Conversation Flow Improvements](#feature-2-conversation-flow-improvements) | **NEW** | P0 |

---

# Feature 1: Sales Team Connection

## 1.1 Overview

### 1.1.1 Background

현재 Mapiker-AI 챗봇은 제품 요구사항 수집 및 추천만 수행합니다. 유저가 "지도 제품을 활용한 시스템/서비스 구축 요청" 등 추가 요구사항을 언급할 경우, 세일즈 팀으로 연결하는 기능이 필요합니다.

### 1.1.2 Current State

```
┌─────────────────────────────────────────────────────────────┐
│ ChatWindow                                                   │
├─────────────────────────────────────────────────────────────┤
│ User: "시스템 구축도 도와줄 수 있나요?"                         │
│                                                              │
│ Bot: [현재] 제품 추천 플로우만 진행                            │
│      [문제] 세일즈 연결 없음                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ ContactSalesButton (화면 우측 하단)                          │
│ - 별도 플로팅 버튼으로만 존재                                 │
│ - 챗봇 대화와 연동 안됨                                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.1.3 Target State

```
┌─────────────────────────────────────────────────────────────┐
│ ChatWindow                                                   │
├─────────────────────────────────────────────────────────────┤
│ User: "시스템 구축도 도와줄 수 있나요?"                         │
│                                                              │
│ Bot: "네, 저희 세일즈 팀이 도와드릴 수 있습니다.               │
│      연락처를 남겨주시면 담당자가 연락드리겠습니다."            │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📞 Contact Sales Team                                   │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Name: [________________]                            │ │ │
│ │ │ Email: [________________]                           │ │ │
│ │ │ Phone: [________________] (optional)                │ │ │
│ │ │ Request: [________________________]                 │ │ │
│ │ │ [Submit Request]                                    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 1.2 Requirements

### 1.2.1 Functional Requirements

| # | 요구사항 | 우선순위 |
|---|----------|----------|
| FR-1 | 챗봇이 세일즈 연결 의도를 자동 감지 | High |
| FR-2 | 감지 시 인라인 연락처 폼 표시 | High |
| FR-3 | 폼 제출 시 세일즈 팀에 이메일 알림 | High |
| FR-4 | 폼 제출 후 챗봇 대화 계속 가능 | Medium |
| FR-5 | 대화 컨텍스트 (use_case, features 등) 함께 전달 | Medium |

### 1.2.2 Sales Intent Detection Keywords

다음 키워드/패턴 감지 시 세일즈 연결 트리거:

**한국어:**
- "시스템 구축"
- "서비스 개발"
- "개발 대행"
- "컨설팅"
- "도움을 받고 싶"
- "담당자와 상담"
- "견적"
- "계약"

**영어:**
- "build a system"
- "develop a service"
- "development help"
- "consulting"
- "talk to sales"
- "talk to someone"
- "get a quote"
- "contract"
- "implementation help"

---

## 1.3 Technical Design

### 1.3.1 Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   ChatWindow     │────▶│   chat_agent.py  │────▶│   contact.py     │
│   (Frontend)     │     │   (Backend)      │     │   (Backend)      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        │ 1. User message        │ 2. Detect intent       │
        │────────────────────────▶ 3. Return response     │
        │                        │    with trigger        │
        │ 4. Show inline form    │                        │
        │◀───────────────────────│                        │
        │                        │                        │
        │ 5. Submit form         │                        │
        │───────────────────────────────────────────────▶│
        │                        │                        │ 6. Send email
        │ 7. Confirmation        │                        │
        │◀───────────────────────────────────────────────│
```

### 1.3.2 API Response Schema Changes

**현재 chat API 응답:**
```json
{
  "reply": "Assistant's response",
  "extracted_requirements": {...} | null,
  "is_complete": true | false
}
```

**변경 후 응답:**
```json
{
  "reply": "Assistant's response",
  "extracted_requirements": {...} | null,
  "is_complete": true | false,
  "trigger_sales_form": true | false,    // NEW
  "sales_context": {                      // NEW (optional)
    "detected_intent": "system-build",
    "conversation_summary": "..."
  }
}
```

### 1.3.3 Contact API Extension

**새 엔드포인트 또는 기존 확장:**

```python
# backend/routers/contact.py

class SalesLeadRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    request_details: str
    # Chat context
    conversation_history: Optional[list[dict]] = None
    detected_intent: Optional[str] = None
    use_case: Optional[str] = None
    region: Optional[str] = None
    required_features: Optional[list[str]] = None

@router.post("/sales-lead", response_model=ContactResponse)
async def submit_sales_lead(request: SalesLeadRequest):
    """Submit sales lead from chatbot"""
    # ... implementation
```

---

## 1.4 Implementation Plan

### 1.4.1 Phase A: Backend - Intent Detection (chat_agent.py)

**파일:** `backend/services/chat_agent.py`

**수정 내용:**

1. SYSTEM_PROMPT에 세일즈 의도 감지 지시 추가
2. 세일즈 트리거 마커 `[SALES_CONNECT]` 정의
3. 응답 파싱에서 세일즈 트리거 감지

**코드 변경:**

```python
# chat_agent.py 수정

SALES_INTENT_KEYWORDS = [
    # Korean
    "시스템 구축", "서비스 개발", "개발 대행", "컨설팅",
    "도움을 받고 싶", "담당자와 상담", "견적", "계약",
    # English
    "build a system", "develop a service", "development help",
    "consulting", "talk to sales", "get a quote", "contract"
]

# SYSTEM_PROMPT에 추가할 내용:
"""
## Sales Connection Detection

If the user asks about any of the following, respond with a sales connection offer:
- System/service development or implementation help
- Consulting or professional services
- Getting a quote or pricing discussion
- Talking to a sales representative
- Contract or licensing discussions

When you detect such intent, respond naturally offering to connect them with our sales team, and end your response with:
[SALES_CONNECT]

Example:
User: "Can you help us build a complete delivery system?"
Response: "Absolutely! Our sales team can help you with full system implementation. They can discuss your specific requirements, provide customized solutions, and give you a detailed quote. Would you like me to connect you with them? Just fill out the form below, and a team member will reach out within 1 business day.
[SALES_CONNECT]"
"""
```

**chat() 메서드 수정:**
```python
def chat(self, message: str, conversation_history: List[Dict]) -> Dict:
    # ... existing code ...

    # Check for sales trigger
    trigger_sales_form = "[SALES_CONNECT]" in reply

    if trigger_sales_form:
        reply = reply.replace("[SALES_CONNECT]", "").strip()

    return {
        "reply": reply,
        "extracted_requirements": extracted_requirements,
        "is_complete": is_complete,
        "trigger_sales_form": trigger_sales_form  # NEW
    }
```

### 1.4.2 Phase B: Backend - Sales Lead API (contact.py)

**파일:** `backend/routers/contact.py`

**추가 내용:**

```python
class SalesLeadRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    request_details: str
    # Chat context
    conversation_history: Optional[list[dict]] = None
    use_case: Optional[str] = None
    region: Optional[str] = None
    required_features: Optional[list[str]] = None


@router.post("/sales-lead", response_model=ContactResponse)
async def submit_sales_lead(request: SalesLeadRequest):
    """Submit sales lead from chatbot conversation"""

    try:
        admin_email = os.getenv("ADMIN_EMAIL", os.getenv("SMTP_EMAIL"))
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Build context section
        context_html = ""
        if request.use_case or request.region or request.required_features:
            context_html = """
            <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
                <h3>Conversation Context</h3>
            """
            if request.use_case:
                context_html += f'<p><strong>Use Case:</strong> {request.use_case}</p>'
            if request.region:
                context_html += f'<p><strong>Region:</strong> {request.region}</p>'
            if request.required_features:
                context_html += f'<p><strong>Features:</strong> {", ".join(request.required_features)}</p>'
            context_html += "</div>"

        # Build conversation history section
        history_html = ""
        if request.conversation_history:
            history_html = """
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                <h3>Conversation History</h3>
            """
            for msg in request.conversation_history[-10:]:  # Last 10 messages
                role_label = "User" if msg.get("role") == "user" else "Bot"
                history_html += f'<p><strong>{role_label}:</strong> {msg.get("content", "")[:200]}</p>'
            history_html += "</div>"

        # Admin email
        admin_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0;">🔥 New Sales Lead from Chatbot</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb;">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {request.name}</p>
                <p><strong>Email:</strong> {request.email}</p>
                <p><strong>Phone:</strong> {request.phone or "Not provided"}</p>
                <p><strong>Request:</strong> {request.request_details}</p>
                {context_html}
                {history_html}
                <p style="color: #6b7280; font-size: 12px;">Received: {timestamp}</p>
            </div>
        </body>
        </html>
        """

        send_email(
            to_email=admin_email,
            subject=f"🔥 [Sales Lead] {request.name} - Chatbot",
            html_body=admin_html,
            reply_to=request.email
        )

        # Customer confirmation
        customer_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px;">✅</div>
                <h1>Thank You, {request.name}!</h1>
                <p>We've received your request and our sales team will contact you within 1 business day.</p>
                <p style="color: #6b7280;">Your request: {request.request_details}</p>
            </div>
        </body>
        </html>
        """

        send_email(
            to_email=request.email,
            subject="We'll be in touch soon! - Mapiker-AI",
            html_body=customer_html
        )

        return ContactResponse(
            success=True,
            message="Your request has been submitted. Our sales team will contact you soon!"
        )

    except Exception as e:
        logger.error(f"Sales lead error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit request")
```

### 1.4.3 Phase C: Frontend - API Types & Functions

**파일:** `frontend/src/lib/types.ts`

```typescript
// ChatResponse 타입 확장
export interface ChatResponse {
  reply: string;
  extracted_requirements: Requirements | null;
  is_complete: boolean;
  trigger_sales_form?: boolean;  // NEW
}
```

**파일:** `frontend/src/lib/api.ts`

```typescript
// 새 API 함수 추가
export interface SalesLeadRequest {
  name: string;
  email: string;
  phone?: string;
  request_details: string;
  conversation_history?: ChatMessage[];
  use_case?: string;
  region?: string;
  required_features?: string[];
}

export async function submitSalesLead(data: SalesLeadRequest): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/contact/sales-lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to submit sales lead");
  }

  return response.json();
}
```

### 1.4.4 Phase D: Frontend - Inline Sales Form Component

**파일:** `frontend/src/components/chat/InlineSalesForm.tsx` (신규)

```typescript
"use client";

import { useState } from "react";
import { submitSalesLead, SalesLeadRequest } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

interface InlineSalesFormProps {
  conversationHistory: ChatMessage[];
  useCase?: string;
  region?: string;
  requiredFeatures?: string[];
  onSubmitSuccess?: () => void;
}

export default function InlineSalesForm({
  conversationHistory,
  useCase,
  region,
  requiredFeatures,
  onSubmitSuccess,
}: InlineSalesFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    request_details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitSalesLead({
        ...formData,
        conversation_history: conversationHistory,
        use_case: useCase,
        region: region,
        required_features: requiredFeatures,
      });
      setIsSubmitted(true);
      onSubmitSuccess?.();
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-lg p-4 my-3">
        <div className="flex items-center gap-2">
          <span className="text-[#0f7b6c] text-xl">✓</span>
          <div>
            <p className="font-medium text-[#0f7b6c]">Request Submitted!</p>
            <p className="text-sm text-[#0f7b6c]">
              Our sales team will contact you within 1 business day.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e9e9e7] rounded-lg p-4 my-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📞</span>
        <h4 className="font-semibold text-[#37352f]">Contact Sales Team</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email address"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm"
        />
        <input
          type="tel"
          placeholder="Phone number (optional)"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm"
        />
        <textarea
          required
          placeholder="What would you like help with?"
          value={formData.request_details}
          onChange={(e) => setFormData(prev => ({ ...prev, request_details: e.target.value }))}
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm resize-none"
          rows={3}
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] disabled:opacity-50 text-sm"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
```

### 1.4.5 Phase E: Frontend - ChatWindow Integration

**파일:** `frontend/src/components/chat/ChatWindow.tsx`

**수정 내용:**

1. `trigger_sales_form` 응답 처리
2. 메시지 리스트에 인라인 폼 렌더링
3. 폼 제출 후 상태 관리

```typescript
// ChatWindow.tsx 수정

import InlineSalesForm from "./InlineSalesForm";

// 상태 추가
const [showSalesForm, setShowSalesForm] = useState(false);
const [salesFormMessageIndex, setSalesFormMessageIndex] = useState<number | null>(null);

// handleSubmit 수정
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...

  try {
    const response = await sendChatMessage(userMessage, messages);

    // Add assistant response
    setMessages([
      ...newMessages,
      { role: "assistant", content: response.reply },
    ]);

    // Check if sales form should be shown
    if (response.trigger_sales_form) {
      setShowSalesForm(true);
      setSalesFormMessageIndex(newMessages.length); // Index after assistant message
    }

    // ... rest of existing code ...
  }
};

// 렌더링 부분 수정
{messages.map((message, index) => (
  <React.Fragment key={index}>
    <ChatMessage message={message} />
    {showSalesForm && salesFormMessageIndex === index && (
      <InlineSalesForm
        conversationHistory={messages}
        useCase={requirements?.use_case}
        region={requirements?.region}
        requiredFeatures={requirements?.required_features}
        onSubmitSuccess={() => setShowSalesForm(false)}
      />
    )}
  </React.Fragment>
))}
```

---

## 1.5 File Changes Summary

### 1.5.1 Backend

| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `backend/services/chat_agent.py` | Modify | SYSTEM_PROMPT에 세일즈 감지 지시 추가, [SALES_CONNECT] 마커 처리 |
| `backend/routers/contact.py` | Modify | `/sales-lead` 엔드포인트 추가 |

### 1.5.2 Frontend

| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/lib/types.ts` | Modify | ChatResponse에 `trigger_sales_form` 추가 |
| `frontend/src/lib/api.ts` | Modify | `submitSalesLead` 함수 추가 |
| `frontend/src/components/chat/InlineSalesForm.tsx` | Create | 인라인 세일즈 폼 컴포넌트 |
| `frontend/src/components/chat/ChatWindow.tsx` | Modify | 세일즈 폼 트리거 및 렌더링 |

---

## 1.6 Testing Plan

### 1.6.1 Unit Tests

| # | 테스트 | 예상 결과 |
|---|--------|----------|
| T-1 | 세일즈 키워드 감지 | "시스템 구축" 입력 시 `trigger_sales_form: true` |
| T-2 | 일반 대화 | "food delivery" 입력 시 `trigger_sales_form: false` |
| T-3 | 폼 제출 | 유효한 데이터 제출 시 이메일 발송 성공 |
| T-4 | 폼 검증 | 이메일 형식 오류 시 에러 메시지 |

### 1.6.2 Integration Tests

| # | 시나리오 | 예상 결과 |
|---|----------|----------|
| E2E-1 | 전체 플로우 | 세일즈 요청 → 폼 표시 → 제출 → 확인 메시지 |
| E2E-2 | 폼 제출 후 대화 계속 | 폼 제출 후에도 제품 추천 플로우 진행 가능 |
| E2E-3 | 이메일 수신 확인 | Admin과 Customer 양쪽 이메일 정상 수신 |

---

## 1.7 Verification Checklist

- [ ] 세일즈 키워드 입력 시 폼 표시
- [ ] 한국어/영어 키워드 모두 감지
- [ ] 인라인 폼 정상 렌더링
- [ ] 폼 제출 성공 시 확인 메시지
- [ ] Admin 이메일 수신 (대화 컨텍스트 포함)
- [ ] Customer 확인 이메일 수신
- [ ] 폼 제출 후 대화 계속 가능
- [ ] 모바일 반응형 UI

---

## 1.8 Confirmed Requirements

| # | 질문 | 답변 |
|---|------|------|
| 1 | 세일즈 알림을 Slack으로도 보낼지? | ❌ 불필요 |
| 2 | 폼에 회사명 필드도 추가할지? | ✅ 추가 |
| 3 | 대화 히스토리를 얼마나 저장할지? | ✅ 전체 저장, 파일로 첨부 |
| 4 | 대화 요약본 | ✅ 이메일 본문에 별도 섹션으로 포함 |

---

## 1.9 Rollout Plan

### 1.9.1 Phase 순서

| 순서 | Phase | 예상 시간 |
|------|-------|----------|
| 1 | Phase A: Backend - Intent Detection | - |
| 2 | Phase B: Backend - Sales Lead API | - |
| 3 | Phase C: Frontend - API Types | - |
| 4 | Phase D: Frontend - InlineSalesForm | - |
| 5 | Phase E: Frontend - ChatWindow Integration | - |
| 6 | Testing & Verification | - |

### 1.9.2 Rollback Plan

문제 발생 시:
1. `trigger_sales_form` 필드 무시 (프론트엔드)
2. 기존 ContactSalesButton으로 폴백

---

# Feature 2: Conversation Flow Improvements

## 2.1 Overview

### 2.1.1 Background

사용자 대화 테스트에서 발견된 UX 문제점들을 개선합니다. 현재 챗봇이 사용자가 이미 제공한 정보를 다시 질문하거나, 다중 선택을 제대로 처리하지 못하는 등의 문제가 있습니다.

### 2.1.2 Identified Issues

**테스트 대화 예시:**
```
User: "I want to make a logistics solution for trucks."  ← trucks 언급
...
Bot: "What type of vehicle(s) will be used?"  ← 다시 질문
User: "trucks"  ← 중복 답변
...
User: "2 and 3 both" (routing type 다중 선택)
Bot: (단일 값만 저장)
...
Summary: (vehicle_types, routing_type 표시 안됨)
```

---

## 2.2 Problem Analysis

### Issue 1: 중복 질문 (Redundant Questions)

| 구분 | 내용 |
|------|------|
| **문제** | 사용자가 첫 메시지에서 "trucks"를 언급했는데 Step 3.5에서 다시 vehicle type 질문 |
| **원인** | SYSTEM_PROMPT에 "REMEMBER and USE that information" 지시가 있지만 LLM이 제대로 따르지 않음 |
| **영향** | 사용자 경험 저하, 불필요한 대화 턴 증가 |

**현재 SYSTEM_PROMPT:**
```
## CRITICAL: Smart Information Extraction
- ALWAYS analyze the user's message for ALL relevant information
- If the user provides information about later steps... REMEMBER and USE that information
```

**문제:** LLM이 지시를 무시하고 정해진 플로우대로 질문함

---

### Issue 2: Routing Type 다중 선택 미지원

| 구분 | 내용 |
|------|------|
| **문제** | 사용자가 "2 and 3 both" 선택 시 하나만 저장됨 |
| **원인** | `routing_type: Optional[str]` - 단일 값만 지원 |
| **영향** | 사용자 요구사항 일부 누락, 부정확한 제품 추천 |

**현재 스키마:**
```python
# pydantic_schemas.py
routing_type: Optional[str] = None  # "single_route", "multi_waypoint", "matrix"
```

**사용자 입력:**
- "2 and 3 both" → multi_waypoint + matrix 둘 다 필요

---

### Issue 3: Summary에 Routing 정보 누락

| 구분 | 내용 |
|------|------|
| **문제** | 최종 Summary에 vehicle_types, routing_type이 표시되지 않음 |
| **원인** | Summary 템플릿에 해당 필드 포함 안됨 |
| **영향** | 사용자가 선택한 정보 확인 불가 |

**현재 Summary:**
```
Use Case: logistics
Platform: backend-operations
Region: Southeast Asia
Features: route-optimization, fleet-tracking, ...
```

**누락된 정보:**
- Vehicle Types: truck
- Routing Types: multi_waypoint, matrix

---

## 2.3 Solution Design

### Solution 1: Context-Aware Question Skipping

**목표:** 이미 제공된 정보는 질문 건너뛰고 확인만

**방법 A: SYSTEM_PROMPT 강화**

```python
# chat_agent.py SYSTEM_PROMPT 수정

"""
### CRITICAL: Context Extraction from First Message
BEFORE asking any questions, extract ALL information from the user's first message:

1. Scan for vehicle keywords: truck, car, bicycle, scooter, ev, pedestrian
2. Scan for platform keywords: mobile, app, web, backend, server, API
3. Scan for region keywords: korea, asia, europe, america, global

If found, store immediately and DO NOT ask again. Instead, confirm:
- "I see you mentioned [trucks] - I'll include truck-specific routing in your recommendations."

### Vehicle Detection Keywords:
- truck, lorry, heavy vehicle, commercial vehicle → vehicle_types: ["truck"]
- bicycle, bike, cycle → vehicle_types: ["bicycle"]
- scooter, 2-wheeler → vehicle_types: ["scooter"]
- car, automobile → vehicle_types: ["car"]
- ev, electric → vehicle_types: ["ev"]
"""
```

**방법 B: 프론트엔드 Pre-parsing**

```typescript
// ChatWindow.tsx - 첫 메시지 분석

const VEHICLE_KEYWORDS = {
  truck: ["truck", "lorry", "heavy vehicle", "commercial"],
  bicycle: ["bicycle", "bike", "cycle"],
  scooter: ["scooter", "2-wheeler", "two-wheeler"],
  car: ["car", "automobile", "vehicle"],
  ev: ["ev", "electric vehicle", "electric car"]
};

function extractVehicleFromMessage(message: string): string[] {
  const detected: string[] = [];
  const lowerMessage = message.toLowerCase();

  for (const [vehicle, keywords] of Object.entries(VEHICLE_KEYWORDS)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      detected.push(vehicle);
    }
  }
  return detected;
}
```

**권장:** 방법 A + B 조합 (백엔드 SYSTEM_PROMPT 강화 + 프론트엔드 보조 파싱)

---

### Solution 2: Routing Type Multi-Select Support

**목표:** 사용자가 여러 routing type 선택 가능

**스키마 변경:**

```python
# pydantic_schemas.py

# Before
routing_type: Optional[str] = None

# After
routing_types: Optional[List[str]] = None  # ["multi_waypoint", "matrix"]
```

**API 변경:**

```python
# routers/products.py - RequirementsRequest

class RequirementsRequest(BaseModel):
    # ... existing fields ...
    routing_types: Optional[List[str]] = None  # Changed from routing_type
```

**Pipeline 변경:**

```python
# improved_pipeline_v2.py

# _run_agent2() 수정
def _run_agent2(self, req, products, routing_types=None):  # List로 변경
    # ...
    for routing_type in (routing_types or []):
        # 각 routing type에 대해 부스트 적용
        boost = get_routing_type_boost(product_id, routing_type)
        total_routing_boost += boost
```

**SYSTEM_PROMPT 변경:**

```python
# chat_agent.py

"""
### Step 3.6: Get Routing Type
...
Users can select MULTIPLE options. Store as array:
- ["single_route"] - just navigation
- ["multi_waypoint", "matrix"] - optimization + distance matrix
- ["single_route", "multi_waypoint", "matrix"] - all three
"""
```

---

### Solution 3: Enhanced Summary Display

**목표:** Summary에 모든 수집된 정보 표시

**SYSTEM_PROMPT 수정:**

```python
# chat_agent.py - Summary 템플릿

"""
When requirements are complete, summarize with ALL captured information:

✓ Requirements captured!

Use Case: {use_case}
Platform: {application}
Region: {region}
Features: {required_features}
Vehicle Types: {vehicle_types or "Not specified"}
Routing Types: {routing_types or "Not specified"}

Click "View Recommended Products" below...
"""
```

**JSON 스키마 업데이트:**

```json
{
  "use_case": "logistics",
  "required_features": ["route-optimization", "fleet-tracking", ...],
  "application": "backend-operations",
  "region": "Southeast Asia",
  "vehicle_types": ["truck"],
  "routing_types": ["multi_waypoint", "matrix"],
  "additional_notes": null
}
```

---

## 2.4 Implementation Plan

### Phase A: Schema Changes (Backend)

| 파일 | 변경 내용 |
|------|----------|
| `backend/pydantic_schemas.py` | `routing_type` → `routing_types: List[str]` |
| `backend/routers/products.py` | `RequirementsRequest` 스키마 업데이트 |
| `backend/improved_pipeline_v2.py` | `_run_agent2()` 파라미터 변경 |

### Phase B: SYSTEM_PROMPT Enhancement (Backend)

| 파일 | 변경 내용 |
|------|----------|
| `backend/services/chat_agent.py` | Context extraction 강화, Summary 템플릿 수정 |

### Phase C: Frontend Updates

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/lib/types.ts` | `routing_types: string[]` 타입 추가 |
| `frontend/src/components/chat/ChatWindow.tsx` | Vehicle keyword pre-parsing (optional) |

---

## 2.5 File Changes Summary

| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `backend/pydantic_schemas.py` | Modify | `routing_type` → `routing_types: List[str]` |
| `backend/routers/products.py` | Modify | `routing_types` 필드 업데이트 |
| `backend/services/product_matcher.py` | Modify | `routing_types` 전달 |
| `backend/improved_pipeline_v2.py` | Modify | 다중 routing type 부스트 처리 |
| `backend/services/chat_agent.py` | Modify | Context extraction, Summary 템플릿 |
| `frontend/src/lib/types.ts` | Modify | 타입 정의 업데이트 |

---

## 2.6 Testing Plan

| # | 테스트 시나리오 | 예상 결과 |
|---|----------------|----------|
| T-1 | "logistics for trucks" 입력 | vehicle type 질문 건너뛰고 확인 메시지 표시 |
| T-2 | Routing type "2 and 3 both" 선택 | `["multi_waypoint", "matrix"]` 저장 |
| T-3 | 대화 완료 | Summary에 vehicle_types, routing_types 표시 |
| T-4 | Multi routing type으로 제품 매칭 | 두 타입 모두에 맞는 제품 우선 추천 |

---

## 2.7 Verification Checklist

- [ ] 첫 메시지에서 vehicle 언급 시 중복 질문 안함
- [ ] Routing type 다중 선택 가능
- [ ] Summary에 vehicle_types 표시
- [ ] Summary에 routing_types 표시
- [ ] 다중 routing type에 대한 제품 부스트 정상 작동
- [ ] 기존 단일 routing_type 호환성 유지

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-22 | Initial plan - Sales Connection | Claude Code |
| 1.1 | 2026-01-22 | Added Feature 2: Conversation Flow Improvements | Claude Code |
