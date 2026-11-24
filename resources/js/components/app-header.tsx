import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogo from './app-logo';

const navigation = [
    { title: 'Dashboard', href: () => route('dashboard') },
    { title: 'Patients', href: () => route('patients.index') },
    { title: 'Doctors', href: () => route('doctors.index') },
    { title: 'Medicines', href: () => route('medicines.index') },
    { title: 'Dispensing', href: () => route('dispense-records.index') },
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="border-border bg-background sticky top-0 z-30 border-b">
            <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                        <SheetHeader className="border-border border-b pb-5">
                            <SheetTitle className="text-left">
                                <AppLogo className="h-8 w-auto max-w-[160px]" />
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="mt-6 grid gap-1" aria-label="Main navigation">
                            {navigation.map((item) => (
                                <Link key={item.title} href={item.href()} className="text-foreground hover:bg-muted px-3 py-2 text-sm font-medium">
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                <div className="min-w-0 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <Link href={route('dashboard')} className="hidden sm:block" aria-label="PPDS dashboard">
                    <AppLogo className="h-6 w-auto max-w-[130px]" />
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-9 rounded-full p-1" aria-label="Open account menu">
                            <Avatar className="size-7">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
