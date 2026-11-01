import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Créer un compte' };
export default function Page() { return <Suspense><AuthForm mode="register" /></Suspense>; }
