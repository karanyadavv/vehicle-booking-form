# Vehicle Booking

This project is a Vehicle Booking system with a **Node.js + Express + Prisma** backend and a **React** frontend using Axios for API calls.

---

## Prerequisites

- Node.js (recommended v20.x)
- PostgreSQL database (running locally or remotely)
- npm or yarn

---

## Setup

### Clone the repository

   ```bash
   git clone https://github.com/karanyadavv/vehicle-booking-form
   
   cd backend

   npm install
   ```

**You can run PostgreSQL via Docker:**

```
docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
```

**Create and configure .env file**

Create a ```.env``` file inside the backend folder with the following content:

```bash
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/
```

**Run Prisma migrations**

```bash
npx prisma migrate dev --name init
```

**Seed the database**

```bash
npm run seed
```

**Start the backend server**

```bash
npm run dev
```

### Frontend Setup

**Navigate to frontend folder**

```bash
cd ../frontend

npm install

npm run dev
```