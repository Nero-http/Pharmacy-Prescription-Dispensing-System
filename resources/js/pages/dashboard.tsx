import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowRight, ClipboardList, Package, PackagePlus, Pill, PlusCircle } from 'lucide-react';

interface DashboardProps {
    stats: {
        total_medicines: number;
        total_stock: number;
        low_stock_medicines: number;
        total_dispensing_records: number;
    };
    recentRecords: {
        id: number;
        dispense_date: string;
        patient_name: string;
        doctor_name: string;
        items: { medicine_name: string; quantity: number }[];
        total: number;
    }[];
    lowStockMedicines: {
        id: number;
        medicine_sku: string;
        medicine_brand: string;
        generic_name: string;
        stock_quantity: number;
    }[];
}

const amount = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard({ stats, recentRecords, lowStockMedicines }: DashboardProps) {
    const cards = [
        { title: 'Total medicines', value: stats.total_medicines, description: 'Products in your catalog', icon: Pill },
        { title: 'Total stock', value: stats.total_stock.toLocaleString(), description: 'Units currently on hand', icon: Package },
        { title: 'Low stock', value: stats.low_stock_medicines, description: 'Medicines at 10 units or less', icon: ArrowDownRight },
        { title: 'Dispensing records', value: stats.total_dispensing_records, description: 'Records created to date', icon: ClipboardList },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('dashboard') }]}>
            <Head title="Dashboard" />
            <main className="space-y-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Pharmacy overview</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="mt-1 text-sm text-muted-foreground">A live view of inventory and dispensing activity.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('medicines.create')}><PackagePlus /> Add medicine</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('dispense-records.create')}><PlusCircle /> Dispense medicine</Link>
                        </Button>
                    </div>
                </div>

                <section aria-label="Pharmacy statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ title, value, description, icon: Icon }) => (
                        <Card key={title} className="rounded-xl shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                                <Icon className="size-4 text-primary" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold tabular-nums">{value}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent dispensing</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">Latest completed dispensing records.</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('dispense-records.index')}>View all <ArrowRight /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentRecords.length === 0 ? (
                                <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
                                    <ClipboardList className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-3 font-medium">No dispensing activity yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">New records will appear here as medicines are dispensed.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentRecords.map((record) => (
                                        <div key={record.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="font-medium">{record.patient_name}</p>
                                                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                                    {record.items.map((item) => `${item.medicine_name} × ${item.quantity}`).join(', ')}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">Dr. {record.doctor_name} · {record.dispense_date}</p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold tabular-nums">{amount.format(record.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Low stock medicines</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">Items with 10 or fewer units remaining.</p>
                            </div>
                            <Button variant="ghost" size="icon" asChild aria-label="View medicine inventory">
                                <Link href={route('medicines.index')}><ArrowRight /></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {lowStockMedicines.length === 0 ? (
                                <div className="rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center">
                                    <Package className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-3 font-medium">Stock levels look good</p>
                                    <p className="mt-1 text-sm text-muted-foreground">No medicines are currently at or below the low-stock threshold.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {lowStockMedicines.map((medicine) => (
                                        <div key={medicine.id} className="flex items-center justify-between gap-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{medicine.medicine_brand}</p>
                                                <p className="truncate text-sm text-muted-foreground">{medicine.generic_name} · {medicine.medicine_sku}</p>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${medicine.stock_quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
                                                {medicine.stock_quantity === 0 ? 'Out of stock' : `${medicine.stock_quantity} left`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}
