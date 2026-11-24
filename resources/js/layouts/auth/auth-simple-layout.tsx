import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-background min-h-svh">
            <div className="grid min-h-svh lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <aside className="border-border bg-muted/40 hidden flex-col justify-between border-r p-10 lg:flex xl:p-14">
                    <Link href={route('home')} aria-label="PPDS home">
                        <AppLogo className="h-10 w-auto max-w-[190px]" />
                    </Link>

                    <div className="max-w-md pb-8">
                        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">Pharmacy operations</p>
                        <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-tight">
                            Clear records.
                            <br />
                            Reliable dispensing.
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">
                            Manage medicines, patients, prescribers, and dispensing history in one dependable workspace.
                        </p>
                    </div>

                    <p className="text-muted-foreground text-xs">PPDS · Pharmacy Prescription Dispensing System</p>
                </aside>

                <main className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
                    <div className="w-full max-w-[410px]">
                        <Link href={route('home')} className="mb-10 inline-flex lg:hidden">
                            <AppLogo className="h-8 w-auto max-w-[156px]" />
                        </Link>

                        <div className="mb-8">
                            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">Account access</p>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
                        </div>

                        {children}

                        <p className="text-muted-foreground mt-8 text-center text-xs">
                            <Link href={route('home')} className="underline-offset-4 hover:underline">
                                Return to PPDS home
                            </Link>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
