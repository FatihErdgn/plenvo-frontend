## Frontend Repository: Plenvo

### Project Overview
The frontend for Plenvo, a modern web application built to manage hospital appointments effectively. This repository focuses on providing a user-friendly interface for patients, doctors, and consultants to interact with the system.

---

### Features
- **Patient Interface**: Create and delete appointments without logging in.
- **Doctor Dashboard**: View, manage, and annotate appointments.
- **Consultant Role**: Monitor appointment statuses efficiently.

---

### Technology Stack
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **API Integration**: Axios

---

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/FatihErdgn/plenvo-frontend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd plenvo-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open the app in your browser at `http://localhost:3000`.

---

### Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
REACT_APP_API_URL=<your_backend_api_url>
```
Replace `<your_backend_api_url>` with the backend API URL.

---

### Folder Structure
- `src/components`: Reusable UI components.
- `src/pages`: Application views and routing setup.
- `src/context`: State management logic.
- `src/styles`: Tailwind CSS configuration and custom styles.

---

### Contributing
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

---

### License
This project is licensed under the [MIT License](LICENSE).

---