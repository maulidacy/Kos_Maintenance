# 🤝 Contributing ke Kos Maintenance

Terima kasih atas minat Anda untuk berkontribusi pada project Kos Maintenance! Kami sangat menghargai kontribusi dari komunitas untuk membuat sistem ini semakin baik.

## 📋 Daftar Isi

- [Cara Berkontribusi](#cara-berkontribusi)
- [Setup Development Environment](#setup-development-environment)
- [Branching Convention](#branching-convention)
- [Commit Message Convention](#commit-message-convention)
- [Coding Style & Linting](#coding-style--linting)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Security](#security)

## 🎯 Cara Berkontribusi

1. Fork repository ini
2. Buat branch baru dari `main`
3. Lakukan perubahan Anda
4. Pastikan semua test pass dan linting clean
5. Commit dengan pesan yang jelas
6. Push ke branch Anda
7. Buat Pull Request

## 🛠️ Setup Development Environment

### Prerequisites

- Node.js 18 atau lebih baru
- PostgreSQL database
- Git
- npm atau yarn

### Langkah Setup

1. **Fork dan Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kos-maintenance.git
   cd kos-maintenance
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/kos_maintenance"
   REPLICA_DATABASE_URL="postgresql://username:password@localhost:5432/kos_maintenance_replica"
   JWT_SECRET="your-super-secret-jwt-key-minimal-32-characters"
   NODE_ENV="development"
   ```

4. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Jalankan migration
   npx prisma migrate dev

   # (Opsional) Seed data untuk testing
   npx prisma db seed
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

6. **Verifikasi Setup**
   - Buka [http://localhost:3000](http://localhost:3000)
   - Coba register user baru
   - Test login dan buat laporan

## 🌿 Branching Convention

Kami menggunakan Git Flow dengan konvensi sebagai berikut:

### Branch Types

- `main` - Branch production/stable
- `develop` - Branch development utama
- `feature/*` - Fitur baru
- `bugfix/*` - Perbaikan bug
- `hotfix/*` - Perbaikan urgent untuk production
- `docs/*` - Update dokumentasi

### Contoh Branch Names

```bash
# Fitur baru
git checkout -b feature/add-report-categories

# Perbaikan bug
git checkout -b bugfix/fix-login-validation

# Update dokumentasi
git checkout -b docs/update-api-docs

# Hotfix
git checkout -b hotfix/fix-auth-middleware
```

## 📝 Commit Message Convention

Kami menggunakan [Conventional Commits](https://conventionalcommits.org/) untuk konsistensi:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Update dokumentasi
- `style`: Perubahan styling (formatting, dll)
- `refactor`: Refactoring code
- `test`: Menambah/memperbaiki test
- `chore`: Maintenance tasks

### Contoh Commit Messages

```bash
# Fitur baru
feat: add report priority system
feat(auth): implement JWT refresh token

# Perbaikan bug
fix: resolve memory leak in report list
fix(api): handle empty response in stats endpoint

# Dokumentasi
docs: update API documentation for v2.0
docs(readme): add deployment guide

# Refactoring
refactor: simplify report status logic
refactor(components): extract reusable form components

# Testing
test: add unit tests for auth utilities
test(api): integration tests for report endpoints
```

## 💻 Coding Style & Linting

### TypeScript & React

- Gunakan TypeScript untuk semua file baru
- Ikuti React best practices
- Gunakan functional components dengan hooks
- Implementasi error boundaries untuk stability

### Code Style

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({ where: { id } });
};

// ❌ Bad
interface user{
id:string
name:string
email:string
}

async function getuserbyid(id){
return await prisma.user.findUnique({where:{id}})
}
```

### Linting

Project ini menggunakan ESLint. Jalankan sebelum commit:

```bash
npm run lint
```

### Pre-commit Hooks

Kami menggunakan Husky untuk pre-commit hooks. Pastikan linting pass sebelum commit.

## 🧪 Testing

### Unit Tests

```bash
# Jalankan semua unit tests
npm run test

# Jalankan test dengan coverage
npm run test:coverage

# Jalankan test untuk file tertentu
npm run test -- src/lib/auth.test.ts
```

### Integration Tests

```bash
# Jalankan integration tests
npm run test:integration
```

### Manual Testing

#### API Testing dengan cURL

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"namaLengkap":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get reports (gunakan token dari login response)
curl -X GET "http://localhost:3000/api/reports?page=1&limit=10" \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

#### E2E Testing

```bash
# Jalankan Cypress tests
npm run test:e2e
```

## 🔄 Pull Request Process

1. **Pastikan branch Anda up-to-date**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Pastikan semua tests pass**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Update dokumentasi jika diperlukan**
   - Update README.md jika ada perubahan API
   - Update komentar kode jika kompleks

4. **Buat Pull Request**
   - Target branch: `develop` (untuk fitur) atau `main` (untuk hotfix)
   - Judul PR mengikuti commit convention
   - Deskripsi detail perubahan yang dibuat
   - Tag reviewer yang sesuai

5. **PR Template**
   ```
   ## Deskripsi
   [Jelaskan perubahan yang dibuat]

   ## Tipe Perubahan
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing done

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Tests added/updated
   - [ ] No breaking changes
   ```

## 🐛 Reporting Issues

### Bug Reports

Gunakan template bug report:

```markdown
**Deskripsi Bug**
[Jelaskan bug secara detail]

**Langkah Reproduksi**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
[Apa yang seharusnya terjadi]

**Screenshots**
[Jika ada, tambahkan screenshot]

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node Version: [e.g. 18.0.0]
- Database: [PostgreSQL 14]
```

### Feature Requests

Gunakan template feature request:

```markdown
**Is your feature request related to a problem?**
[Jelaskan masalahnya]

**Describe the solution you'd like**
[Deskripsikan solusi yang diinginkan]

**Describe alternatives you've considered**
[Alternatif yang sudah dipertimbangkan]

**Additional context**
[Kontekst tambahan]
```

## 🔒 Security

### Reporting Security Issues

Jika Anda menemukan vulnerability, **JANGAN** buat issue publik. Email ke security@kos-maintenance.dev dengan detail vulnerability.

### Security Best Practices

- **Jangan commit secrets**: Pastikan `.env` files tidak di-commit
- **Input validation**: Selalu validasi input user
- **Authentication**: Gunakan JWT dengan expire time
- **Authorization**: Implementasi role-based access control
- **Database**: Gunakan parameterized queries (Prisma handle ini)
- **Dependencies**: Update dependencies secara berkala

### Security Checklist untuk Contributors

- [ ] Tidak ada hardcoded secrets
- [ ] Input validation menggunakan Zod schemas
- [ ] Authentication check pada protected routes
- [ ] Authorization berdasarkan role
- [ ] Error messages tidak leak sensitive info
- [ ] HTTPS digunakan di production
- [ ] Cookie flags (httpOnly, secure, sameSite)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)

## 🙏 Acknowledgments

Terima kasih kepada semua contributors yang telah membantu mengembangkan Kos Maintenance!

---

**Happy Contributing!** 🎉
