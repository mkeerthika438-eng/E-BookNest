import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import Dashboard from './pages/student/Dashboard';
import QRScanner from './pages/student/QRScanner';
import MyBooks from './pages/student/MyBooks';
import Renewals from './pages/student/Renewals';
import Wishlist from './pages/student/Wishlist';
import ReadingHistory from './pages/student/ReadingHistory';
import EBookReader from './pages/student/EBookReader';
import Recommendations from './pages/student/Recommendations';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import BookManagement from './pages/admin/BookManagement';
import BookForm from './pages/admin/BookForm';
import QRManagement from './pages/admin/QRManagement';
import UserList from './pages/admin/UserList';
import BorrowingActivity from './pages/admin/BorrowingActivity';
import RenewalActivity from './pages/admin/RenewalActivity';
import ReviewModeration from './pages/admin/ReviewModeration';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/read/:id" element={
            <ProtectedRoute><EBookReader /></ProtectedRoute>
          } />
        </Route>

        {/* Student dashboard */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/renewals" element={<Renewals />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/reading-history" element={<ReadingHistory />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin dashboard */}
        <Route element={<ProtectedRoute adminOnly><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<BookManagement />} />
          <Route path="/admin/books/add" element={<BookForm />} />
          <Route path="/admin/books/edit/:id" element={<BookForm />} />
          <Route path="/admin/qr" element={<QRManagement />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/borrowings" element={<BorrowingActivity />} />
          <Route path="/admin/renewals" element={<RenewalActivity />} />
          <Route path="/admin/reviews" element={<ReviewModeration />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}
