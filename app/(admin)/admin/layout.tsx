import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import Navbar from '@/components/Navbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    redirect('/login');
  }

  try {
    const payload = await verifyToken(token.value);
    
    // Only admins can access this layout
    if (payload.role !== 'admin') {
      redirect('/user/dashboard');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole={payload.role} userName={payload.email.split('@')[0]} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    redirect('/login');
  }
}