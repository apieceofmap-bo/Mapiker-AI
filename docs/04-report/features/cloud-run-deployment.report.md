# Cloud Run Deployment Report

> **Feature**: cloud-run-deployment
> **Date**: 2026-01-28
> **Status**: Complete
> **PDCA Phase**: Act (Report)

---

## 1. Summary

Google Cloud Run에 Frontend와 Backend 배포 완료.

### Deployment URLs

| Service | URL |
|---------|-----|
| Frontend | https://mapiker-frontend-xxxxxxxxx-an.a.run.app |
| Backend | https://mapiker-backend-xxxxxxxxx-an.a.run.app |

---

## 2. Completed Tasks

### 2.1 Backend Deployment

| Task | Status |
|------|--------|
| Cloud Run 서비스 생성 | ✅ |
| IAM 권한 설정 (Cloud Run Invoker) | ✅ |
| Public 접근 허용 | ✅ |
| Secret Manager 연동 (API Keys) | ✅ |
| CORS 설정 | ✅ |

**해결한 이슈:**
- `.dockerignore`에서 `original_pipeline/` 제외 해제 (pricing.py 의존성)
- `pydantic[email]` 의존성 추가 (EmailStr 사용)
- `httpx`, `aiofiles` 의존성 추가

### 2.2 Frontend Deployment

| Task | Status |
|------|--------|
| Dockerfile 생성 | ✅ |
| cloudbuild.yaml 생성 | ✅ |
| .dockerignore 생성 | ✅ |
| Cloud Build 트리거 설정 | ✅ |
| NEXT_PUBLIC_* 환경변수 빌드타임 주입 | ✅ |

**주요 설정:**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'NEXT_PUBLIC_SUPABASE_URL=${_NEXT_PUBLIC_SUPABASE_URL}'
      - '--build-arg'
      - 'NEXT_PUBLIC_API_URL=${_NEXT_PUBLIC_API_URL}'
      # ... other build args
```

### 2.3 External Service Configuration

| Service | Configuration |
|---------|--------------|
| Supabase Auth | Redirect URL에 Production URL 추가 |
| Google Maps API | HTTP Referrers에 Cloud Run 도메인 추가 |
| Secret Manager | GOOGLE_MAPS_API_KEY 별도 설정 (Gemini API와 분리) |

---

## 3. Bug Fixes (During Deployment)

### 3.1 Products Page Duplicate Navbar

**문제**: `/project/[id]/products` 페이지에 Navbar가 이중으로 표시됨

**원인**: `layout.tsx`와 `page.tsx` 모두에서 Navbar를 렌더링

**해결**: `page.tsx`에서 Navbar import 및 렌더링 제거

### 3.2 Fleet Management Demo Route Missing

**문제**: Mapbox preview에서 Fleet Management 데모가 basemap만 표시되고 route가 없음

**원인**: Fleet Management demo config에 `geofence`만 있고 `route` 속성 없음

**해결**: MapPreview.tsx, MapboxPreview.tsx에 route 설정 추가
```typescript
route: {
  origin: { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng },
  destination: { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng },
  waypoints: [
    { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng },
    { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng },
  ],
}
```

---

## 4. Files Modified/Created

### New Files
- `frontend/Dockerfile`
- `frontend/cloudbuild.yaml`
- `frontend/.dockerignore`

### Modified Files
- `frontend/src/app/project/[id]/products/page.tsx` - 중복 Navbar 제거
- `frontend/src/components/preview/MapPreview.tsx` - Fleet Management route 추가
- `frontend/src/components/preview/MapboxPreview.tsx` - Fleet Management route 추가
- `backend/.dockerignore` - original_pipeline 제외 해제
- `backend/requirements.txt` - pydantic[email], httpx, aiofiles 추가

---

## 5. Lessons Learned

1. **NEXT_PUBLIC_* 변수는 빌드타임 주입 필수**
   - 런타임 환경변수로 주입하면 클라이언트 사이드에서 undefined

2. **Google API 키 분리 관리**
   - Gemini API 키와 Maps API 키는 별도로 관리 필요
   - 각각 다른 제한 설정 적용

3. **Supabase Auth Redirect 설정**
   - Production URL을 Supabase Dashboard에서 수동 설정 필요

4. **Layout vs Page 컴포넌트 책임 분리**
   - 공통 UI (Navbar)는 layout에서만 렌더링
   - Page에서 중복 렌더링 방지

---

## 6. Next Steps

- [ ] Custom 도메인 연결
- [ ] CI/CD 파이프라인 자동화 (GitHub Actions 또는 Cloud Build Trigger)
- [ ] Monitoring 및 Alert 설정
- [ ] 로드 테스트

---

## 7. References

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth)
