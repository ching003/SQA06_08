# API Integration Guide

## Cấu trúc

```
src/api/
├── config.ts              # API configuration (base URL, endpoints)
├── client.ts              # Axios client với interceptors
├── types.ts                # API response types
├── services/               # Service layer cho từng domain
│   ├── userService.ts     # User & Auth APIs
│   ├── jobService.ts      # Job APIs
│   ├── cvService.ts       # CV APIs
│   ├── applicationService.ts  # Application APIs
│   ├── companyService.ts  # Company APIs
│   └── index.ts           # Export all services
└── README.md              # This file
```

## Cách sử dụng

### 1. Import service

```typescript
import { userService, jobService } from '../api/services';
```

### 2. Sử dụng trong component

```typescript
// Login
const handleLogin = async () => {
  try {
    const response = await userService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    // Token và user đã được lưu tự động
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get jobs
const fetchJobs = async () => {
  try {
    const result = await jobService.getJobs({
      page: 1,
      limit: 10,
      location: 'Ho Chi Minh City'
    });
    console.log(result.items); // Array of jobs
    console.log(result.pagination); // Pagination info
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
  }
};
```

## Configuration

### Environment Variables

Tạo file `.env` trong root directory:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### API Base URL

Default: `http://localhost:4000`

Có thể override bằng environment variable `VITE_API_BASE_URL`

## Authentication

- Token được tự động thêm vào request headers
- Token được lưu trong `localStorage` với key `auth_token`
- Khi token hết hạn (401), user sẽ tự động được redirect về login page

## Error Handling

Tất cả API calls throw Error nếu fail. Nên wrap trong try-catch:

```typescript
try {
  const data = await userService.getProfile();
} catch (error) {
  // Handle error
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

## Migration từ Mock Data

Để chuyển từ mock data sang real API:

1. Thay thế import mock data bằng service calls
2. Update component để handle async operations
3. Add loading states và error handling
4. Test với real API

Example:

**Before (Mock):**
```typescript
import { mockJobs } from '../lib/mockData';
const jobs = mockJobs;
```

**After (API):**
```typescript
import { jobService } from '../api/services';
const [jobs, setJobs] = useState([]);
useEffect(() => {
  jobService.getJobs().then(result => setJobs(result.items));
}, []);
```

