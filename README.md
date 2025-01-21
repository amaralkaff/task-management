# Task Management API

API untuk manajemen tugas dengan fitur upload file dan autentikasi.

## Teknologi yang Digunakan

- Node.js & TypeScript
- MySQL untuk database
- GraphQL untuk API
- JWT untuk autentikasi
- Jest untuk testing
- Docker & Docker Compose untuk kontainerisasi
- Swagger UI untuk dokumentasi REST API (Upload File)
- GraphiQL untuk dokumentasi GraphQL

## Fitur

- ✅ Autentikasi user (login/register)
- ✅ CRUD task
- ✅ Upload file untuk task
- ✅ GraphQL API
- ✅ Unit testing & Integration testing
- ✅ Error handling
- ✅ Input validation
- ✅ Docker support

## Struktur Proyek

```
src/
├── application/          # Use cases & business logic
│   ├── auth/
│   ├── task/
│   └── file/
├── domain/              # Entities & repository interfaces
│   ├── entities/
│   └── repositories/
├── infrastructure/      # Implementation details
│   ├── auth/
│   ├── persistence/
│   └── storage/
├── interfaces/          # API layer
│   ├── graphql/
│   └── http/
├── shared/             # Shared utilities & config
├── __tests__/          # Tests
│   ├── unit/
│   └── integration/
```

## Setup Development

### Menggunakan Docker (Direkomendasikan)

1. Pastikan Docker dan Docker Compose sudah terinstall di sistem anda

   ```bash
   docker --version
   docker-compose --version
   ```

2. Clone repository

   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

3. Build dan jalankan container

   ```bash
   docker-compose up --build -d
   ```

   Container akan dimulai dengan urutan:

   - MySQL container akan start terlebih dahulu
   - Health check akan memastikan MySQL sudah siap (~ 5 detik)
   - Aplikasi akan start setelah MySQL siap

4. Cek status container dan health check

   ```bash
   # Cek status container dan health
   docker-compose ps

   # Cek logs aplikasi
   docker-compose logs -f app
   ```

Aplikasi akan tersedia di:

- GraphQL Playground: http://localhost:4000/graphql
- File Upload endpoint: http://localhost:4000/upload

Perintah Docker yang berguna:

```bash
# Menghentikan container
docker-compose down

# Melihat logs
docker-compose logs -f app    # Log aplikasi
docker-compose logs -f mysql  # Log database

# Restart container
docker-compose restart app    # Restart aplikasi
docker-compose restart mysql  # Restart database

# Cek status MySQL health check
docker inspect task-management-api-mysql-1 | grep -A 10 Health

# Masuk ke container
docker-compose exec app sh    # Shell di container aplikasi
docker-compose exec mysql sh  # Shell di container MySQL
```

Struktur Docker:

- Multi-stage build untuk optimasi ukuran image
- Image size: ~154MB
- Volume untuk persistensi data:
  - `mysql_data`: Data MySQL
  - `./uploads`: File yang diupload
- Environment variables dikonfigurasi di `docker-compose.yml`
- Health check untuk memastikan MySQL siap
- Automatic restart untuk kedua container
- Proper startup sequence (MySQL → App)

### Setup Manual

1. Clone repository

```bash
git clone <repository-url>
cd task-management-api
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Sesuaikan nilai-nilai berikut di file `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=task_management_api_baru
JWT_SECRET=your-secret-key
```

4. Jalankan database migrations

```bash
npm run migrate
```

5. Jalankan development server

```bash
npm run dev
```

## Testing

### Coverage Report

```
----------------------------------|---------|----------|---------|---------|-------------------
File                              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------------|---------|----------|---------|---------|-------------------
All files                         |   88.63 |    63.76 |   88.57 |   88.67 |
 src                              |   93.75 |     62.5 |   85.71 |   95.23 |
  server.ts                       |   93.75 |     62.5 |   85.71 |   95.23 | 109,116,125
 src/application/auth             |   96.55 |       80 |     100 |   96.55 | 77
 src/application/file             |   97.61 |       90 |     100 |   97.61 |
  FileUploadUseCase.ts            |     100 |      100 |     100 |     100 |
  FileUseCase.ts                  |   97.05 |       90 |     100 |   97.05 | 84
 src/application/task             |   91.66 |    57.14 |     100 |   91.66 |
  TaskUseCase.ts                  |   91.66 |    57.14 |     100 |   91.66 | 57,124,128
 src/domain/entities              |   89.09 |      100 |   78.57 |   89.09 |
  Entity.ts                       |     100 |      100 |     100 |     100 |
  File.ts                         |   81.25 |      100 |   66.66 |   81.25 | 28-34
  Task.ts                         |     100 |      100 |     100 |     100 |
  User.ts                         |   78.57 |      100 |   57.14 |   78.57 | 29-37
 src/infrastructure/auth          |    90.9 |      100 |     100 |    90.9 |
  JWTAuthService.ts               |    90.9 |      100 |     100 |    90.9 | 20
 src/infrastructure/persistence   |   83.87 |    71.42 |   84.61 |   83.87 |
  MySQLFileRepository.ts          |   93.75 |       75 |     100 |   93.75 | 36
  MySQLTaskRepository.ts          |      72 |     62.5 |      60 |      72 | 29-40,91,101
  MySQLUserRepository.ts          |   90.47 |    77.77 |     100 |   90.47 | 51,65
 src/infrastructure/storage       |     100 |      100 |     100 |     100 |
  LocalFileStorageService.ts      |     100 |      100 |     100 |     100 |
 src/interfaces/graphql/resolvers |   81.11 |       50 |     100 |   80.68 |
  TaskResolver.ts                 |    78.2 |    48.14 |     100 |   77.92 | ...07,217,229,235
  UserResolver.ts                 |     100 |      100 |     100 |     100 |
  index.ts                        |     100 |      100 |     100 |     100 |
 src/interfaces/http/controllers  |   84.61 |    33.33 |     100 |   84.61 |
  FileUploadController.ts         |   84.61 |    33.33 |     100 |   84.61 | 21,26
 src/interfaces/http/middleware   |   89.47 |    69.23 |     100 |   88.88 |
  authMiddleware.ts               |   82.35 |       60 |     100 |   81.25 | 29,38,49
  errorHandler.ts                 |     100 |    83.33 |     100 |     100 | 27
  upload.ts                       |    87.5 |       50 |     100 |    87.5 | 24
 src/shared/config                |      50 |       25 |       0 |      50 |
  auth.ts                         |     100 |       50 |     100 |     100 | 1
  database.ts                     |   45.45 |        0 |       0 |   45.45 | 20-30
 src/shared/errors                |     100 |    66.66 |     100 |     100 |
  AppError.ts                     |     100 |    66.66 |     100 |     100 | 5
 src/shared/utils                 |   78.94 |    58.33 |      75 |   78.94 |
  password.ts                     |   88.88 |       75 |     100 |   88.88 | 16
  token.ts                        |      70 |       50 |      50 |      70 | 10,22,26
 src/shared/validators            |     100 |    83.33 |     100 |     100 |
  authValidators.ts               |     100 |      100 |     100 |     100 |
  taskValidators.ts               |     100 |    83.33 |     100 |     100 | 41
----------------------------------|---------|----------|---------|---------|-------------------
```

### Test Stats

- Total Test Suites: 14 passed
- Total Tests: 111 passed
- Coverage Statements: 88.63%
- Coverage Branches: 63.76%
- Coverage Functions: 88.57%
- Coverage Lines: 88.67%

### Unit Tests

- ✅ Task Use Case Tests
  - Create, update, delete task
  - Filter dan search task
  - Validasi input
  - Error handling
- ✅ User Use Case Tests
  - Register dan login
  - Password hashing
  - JWT token generation
- ✅ File Use Case Tests
  - Upload file
  - Validasi file
  - Error handling
- ✅ File Upload Controller Tests
  - Upload file handling
  - Error handling
- ✅ Task Resolver Tests
  - GraphQL queries dan mutations
  - Error handling

### Integration Tests

- ✅ Task API Tests
  - GraphQL queries dan mutations
  - Filter dan search
  - Authorization
- ✅ Auth API Tests
  - Register endpoint
  - Login endpoint
  - JWT validation
- ✅ File Upload Tests
  - Multipart upload
  - File validation
  - Error handling

Jalankan test:

```bash
npm test
```

Lihat coverage test:

```bash
npm run test:coverage
```

## API Documentation

### GraphQL Endpoints

- `/graphql` - GraphQL endpoint utama dengan GraphiQL playground

### Queries

1. Get Tasks (dengan filter & pencarian):

- Filter:
  - filterByStatus: ["pending", "in_progress", "completed"]
  - filterByDueDate: "YYYY-MM-DD"
  - search: "keyword"

```graphql
query GetTasks($filter: TaskFilterInput) {
  tasks(filter: $filter) {
    id
    title
    description
    status
    dueDate
    files {
      id
      filename
      mimetype
      size
    }
  }
}

# Variables (semua field opsional)
{
  "filter": {
    "filterByStatus": "pending",
    "filterByDueDate": "2025-01-20",
    "search": "task"
  }
}

# Authorization: Bearer <jwt_token>
{
  "Authorization": "Bearer jwt_token"
}

# Contoh Response
{
  "data": {
    "tasks": [
      {
        "id": "task-123",
        "title": "Test Task",
        "description": "Task Description",
        "status": "pending",
        "dueDate": "2024-03-20T00:00:00.000Z",
        "files": [
          {
            "id": "file-123",
            "filename": "document.pdf",
            "mimetype": "application/pdf",
            "size": 1048576
          }
        ]
      }
    ]
  }
}
```

2. Get Task Detail:

```graphql
query GetTaskDetail($id: ID!) {
  task(id: $id) {
    id
    title
    description
    status
    dueDate
    files {
      id
      filename
      mimetype
      size
    }
  }
}

# Variables
{
  "id": "31b46fdb-1118-4406-a95b-b6d7ca59f9ee"
}

# Authorization: Bearer <jwt_token>
{
  "Authorization": "Bearer jwt_token"
}

# Contoh Response
{
  "data": {
    "task": {
      "id": "31b46fdb-1118-4406-a95b-b6d7ca59f9ee",
      "title": "Test Task",
      "description": "Task Description",
      "status": "pending",
      "dueDate": "2024-03-20T00:00:00.000Z",
    }
  }
}
```

### Mutations

1. Register User:

- Password harus mengandung huruf besar, kecil, dan angka
- Minimal 8 karakter

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
    }
  }
}

# Variables
{
  "input": {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "User Name"
  }
}

# Contoh Response
{
  "data": {
    "register": {
      "token": "jwt_token",
      "user": { "id": "user-id", "email": "user@example.com", "name": "User Name" }
    }
  }
}
```

2. Login User:

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
    }
  }
}

# Variables
{
  "input": {
    "email": "user@example.com",
    "password": "Password123!"
  }
}

# Contoh Response
{
  "data": {
    "login": {
      "token": "jwt_token",
      "user": { "id": "user-id", "email": "user@example.com", "name": "User Name" }
    }
  }
}
```

3. Create Task:

- Header Authorization harus mengandung JWT token (Bearer <jwt_token>)
- Status harus salah satu dari ["pending", "in_progress", "completed"]

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    description
    status
    dueDate
  }
}

# Variables
{
  "input": {
    "title": "Task Title",
    "description": "Task Description",
    "status": "pending",
    "dueDate": "2024-03-20"
  }
}

# Authorization: Bearer <jwt_token>
{
  "Authorization": "Bearer jwt_token"
}

# Contoh Response
{
  "data": {
    "createTask": {
      "id": "task-123",
      "title": "Task Title",
      "description": "Task Description",
      "status": "pending",
      "dueDate": "2024-03-20T00:00:00.000Z"
    }
  }
}
```

4. Update Task:

- ID task harus diisi => contohnya (31b46fdb-1118-4406-a95b-b6d7ca59f9ee)
- Opsional: title, description, status, dueDate => Opsional karena tidak semua field harus diupdate
- Status harus salah satu dari ["pending", "in_progress", "completed"]

```graphql
mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    id
    title
    description
    status
    dueDate
  }
}

# Variables
{
  "id": "31b46fdb-1118-4406-a95b-b6d7ca59f9ee",
  "input": {
    "title": "Updated Task",
    "description": "New desc",
    "status": "in_progress",
    "dueDate": "2024-03-21"
  }
}

# Authorization: Bearer <jwt_token>
{
  "Authorization": "Bearer jwt_token"
}

# Contoh Response
{
  "data": {
    "updateTask": {
      "id": "task-123",
      "title": "Updated Task",
      "description": "New desc",
      "status": "in_progress",
      "dueDate": "2024-03-21T00:00:00.000Z"
    }
  }
}
```

5. Delete Task: (soft delete)

- ID task harus diisi => contohnya (31b46fdb-1118-4406-a95b-b6d7ca59f9ee)
- Status task akan diubah menjadi "deleted" (tidak akan dihapus dari database)

```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id)
}

# Variables
{
  "id": "31b46fdb-1118-4406-a95b-b6d7ca59f9ee"
}

# Authorization: Bearer <jwt_token>
{
  "Authorization": "Bearer jwt_token"
}

# Contoh Response
{
  "data": {
    "deleteTask": true
  }
}
```

**Mengapa REST API untuk Upload File?**

> Untuk fitur upload file, dalam tes ini, saya menggunakan REST API meskipun aplikasi utamanya menggunakan GraphQL. Alasannya adalah sebagai berikut:
> 1. **Performa yang lebih baik**: REST API memiliki dukungan asli untuk streaming data dan data formulir multipart sehingga lebih dioptimalkan untuk upload file biner.
> 2. **Fitur Upload**: Saya akan memiliki kemungkinan lebih besar untuk mengupload progres yang ditampilkan pada saat diupload oleh pengguna saat mengupload data yang sangat besar melalui REST API.
> 3. **Dukungan pada Tingkat Perpustakaan**: Sebagian besar library frontend pihak ketiga menangani upload implementasi file melalui REST API.
> 4. **Mengikuti Norma Industri**: Dengan pengalaman pribadi dalam praktik menjadi developer, hal tersebut akan mudah diadopsi.
>

**Persyaratan:**

- Pengguna harus masuk terlebih dahulu kemudian melanjutkan untuk mengupload.
- Harus menyediakan token JWT melalui header Otorisasi (Bearer <jwt_token>)

Untuk upload file ke task, gunakan endpoint REST berikut:

```bash
POST /upload
```

Headers yang diperlukan:

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

Form fields:

- `file`: File yang akan diupload (Required)
- `taskId`: ID task yang akan dilampiri file (Required)

Batasan upload file:

- Maksimal ukuran: 5MB
- Format yang didukung: .txt, .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png
- Setiap task bisa memiliki multiple files

**Cara Upload Menggunakan Swagger UI**

1. Buka Swagger UI di browser:
   ```
   http://localhost:4000/api-docs
   ```

2. Autentikasi:
   - Klik tombol "Authorize" di bagian atas halaman
   - Masukkan token JWT dengan format: `Bearer <jwt_token>`
   - Klik "Authorize" untuk menyimpan token

3. Upload File:
   - Cari endpoint `POST /upload` di daftar endpoint
   - Klik untuk membuka detail endpoint
   - Klik tombol "Try it out"
   - Isi form yang muncul:
     - `file`: Klik "Choose File" dan pilih file yang akan diupload
     - `taskId`: Masukkan ID task yang valid
   - Klik "Execute" untuk mengirim request

4. Response yang Mungkin:

   Sukses (200 OK):
   ```json
   {
     "success": true,
     "data": {
       "id": "file-123",
       "filename": "document.pdf",
       "mimetype": "application/pdf",
       "size": 1048576,
       "taskId": "task-123"
     }
   }
   ```

   Error Response akan otomatis ditampilkan di bagian "Response" jika terjadi kesalahan.

Batasan Upload:
- Maksimal ukuran: 5MB
- Format yang didukung: .txt, .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png
- Setiap task bisa memiliki multiple files

## Dokumentasi API

### Dokumentasi REST API
Swagger UI dapat diakses melalui: http://localhost:4000/api-docs
- Berisi dokumentasi lengkap untuk semua endpoint REST API
- Dilengkapi fitur uji coba langsung untuk mencoba endpoint
- Sistem autentikasi menggunakan token Bearer
- Penjelasan lengkap format permintaan dan respons
- Daftar kode error beserta penanganannya

### Playground GraphQL
GraphQL Playground dapat diakses melalui: http://localhost:4000/graphql
- IDE GraphQL yang interaktif untuk mencoba API
- Fitur untuk menguji query dan mutation secara langsung
- Eksplorasi skema API yang tersedia
- Riwayat permintaan yang pernah dilakukan
- Pengaturan header autentikasi yang mudah
