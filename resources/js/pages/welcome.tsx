import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';

const workflows = [
    {
        number: '01',
        title: 'Maintain the catalog',
        description: 'Keep medicine details, pricing, and current stock in one place.',
    },
    {
        number: '02',
        title: 'Record a prescription',
        description: 'Connect each dispense to its patient, prescriber, and medicines.',
    },
    {
        number: '03',
        title: 'Review with confidence',
        description: 'Find dispensing history and identify stock that needs attention.',
    },
];

const modules = [
    ['Patients', 'A dependable patient directory'],
    ['Doctors', 'Prescriber details and licenses'],
    ['Medicines', 'Catalog, prices, and stock status'],
    ['Dispensing', 'Traceable prescription records'],
];

export default function Welcome() {
    return (
        <div className="bg-background min-h-svh">
            <Head title="Home" />

            <header className="border-border bg-card border-b">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link href={route('home')} aria-label="PPDS home">
                        <AppLogo className="h-9 w-auto max-w-[190px]" />
                    </Link>
                    <Button asChild size="sm">
                        <Link href={route('login')}>Log in</Link>
                    </Button>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:py-28">
                    <div className="max-w-2xl">
                        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">Pharmacy Prescription Dispensing System</p>
                        <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem]">
                            Clear records for
                            <br className="hidden sm:block" /> careful dispensing.
                        </h1>
                        <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7 sm:text-lg">
                            PPDS brings medicine inventory, patient and prescriber details, and prescription history together in a focused workspace
                            for everyday pharmacy operations.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Button asChild size="lg">
                                <Link href={route('login')}>Sign in to PPDS</Link>
                            </Button>
                            <span className="text-muted-foreground text-sm">Secure access for your pharmacy team</span>
                        </div>
                    </div>

                    <div className="border-border bg-card border-y px-5 py-2 sm:px-7">
                        <p className="text-muted-foreground pt-5 pb-4 text-xs font-semibold tracking-[0.14em] uppercase">
                            A practical daily workflow
                        </p>
                        <ol className="divide-border divide-y">
                            {workflows.map((workflow) => (
                                <li key={workflow.number} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr]">
                                    <span className="text-primary font-mono text-xs">{workflow.number}</span>
                                    <div>
                                        <h2 className="text-sm font-semibold">{workflow.title}</h2>
                                        <p className="text-muted-foreground mt-1 text-sm leading-6">{workflow.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="border-border bg-card border-y">
                    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
                        <div className="max-w-xl">
                            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">One connected workspace</p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">The details behind every dispense.</h2>
                        </div>
                        <div className="border-border mt-8 grid border-t sm:grid-cols-2 lg:grid-cols-4">
                            {modules.map(([title, description]) => (
                                <div
                                    key={title}
                                    className="border-border border-b py-5 sm:px-4 sm:first:pl-0 lg:border-r lg:border-b-0 lg:first:pl-0 lg:last:border-r-0"
                                >
                                    <h3 className="text-sm font-semibold">{title}</h3>
                                    <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span>PPDS · Pharmacy Prescription Dispensing System</span>
                <span>Designed for accurate, traceable pharmacy operations.</span>
            </footer>
        </div>
    );
}
