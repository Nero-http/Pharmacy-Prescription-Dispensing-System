
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    Package,
    Pill,
    Plus,
} from 'lucide-react';

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

const amount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatDoctorName = (name: string): string => {
    const cleanName = name
        .replace(/\s*\[ppds demo\]\s*$/i, '')
        .trim();

    return /^dr\.?\s*/i.test(cleanName)
        ? cleanName
        : `Dr. ${cleanName}`;
};

const statistics = [
    { title: 'Total Medicines', key: 'total_medicines' },
    { title: 'Total Stock', key: 'total_stock' },
    { title: 'Low Stock', key: 'low_stock_medicines' },
    { title: 'Dispensing Records', key: 'total_dispensing_records' },
] as const;

export default function Dashboard({
    stats,
    recentRecords,
    lowStockMedicines,
}: DashboardProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
            ]}
        >
            <Head title="Dashboard" />

            <main className="space-y-6 p-5 md:p-7">
                {/* Page heading */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Overview of medicine inventory and dispensing records.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('medicines.create')}>
                                <Plus className="mr-2 size-4" />
                                Add Medicine
                            </Link>
                        </Button>

                        <Button asChild className="bg-emerald-700 text-white hover:bg-emerald-800">
                            <Link href={route('dispense-records.create')}>
                                <Plus className="mr-2 size-4" />
                                New Dispensing
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Statistics */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map((item) => (
                        <Card key={item.key} className="rounded-lg shadow-none">
                            <CardContent className="p-5">
                                <p className="text-sm text-muted-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-2 text-2xl font-semibold tabular-nums">
                                    {stats[item.key].toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                {/* Main content */}
                <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                    {/* Recent dispensing */}
                    <Card className="rounded-lg shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Recent Dispensing
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Recently recorded transactions
                                </p>
                            </div>

                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('dispense-records.index')}>
                                    View all
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            {recentRecords.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <ClipboardList className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-3 text-sm font-medium">
                                        No dispensing records yet
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        New transactions will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {record.patient_name}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {record.items
                                                        .map(
                                                            (item) =>
                                                                `${item.medicine_name} × ${item.quantity}`,
                                                        )
                                                        .join(', ') || 'No medicine details'}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDoctorName(record.doctor_name)}
                                                    <span className="mx-2">·</span>
                                                    {record.dispense_date}
                                                </p>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-sm font-medium tabular-nums">
                                                    {amount.format(record.total)}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Recorded
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low stock */}
                    <Card className="rounded-lg shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Low Stock Medicines
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Medicines with 10 or fewer units
                                </p>
                            </div>

                            <Button variant="ghost" size="icon" asChild>
                                <Link
                                    href={route('medicines.index')}
                                    aria-label="View medicine inventory"
                                >
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            {lowStockMedicines.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <Package className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-3 text-sm font-medium">
                                        No low stock medicines
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        All listed medicines have sufficient stock.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {lowStockMedicines.map((medicine) => (
                                        <div
                                            key={medicine.id}
                                            className="flex items-center justify-between gap-3 px-5 py-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {medicine.medicine_brand}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {medicine.generic_name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    SKU: {medicine.medicine_sku}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 text-xs font-medium ${
                                                    medicine.stock_quantity === 0
                                                        ? 'text-red-600'
                                                        : 'text-amber-600'
                                                }`}
                                            >
                                                {medicine.stock_quantity === 0
                                                    ? 'Out of stock'
                                                    : `${medicine.stock_quantity} left`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {lowStockMedicines.length > 0 && (
                                <div className="border-t px-5 py-3">
                                    <Link
                                        href={route('medicines.index')}
                                        className="text-sm text-emerald-700 hover:underline"
                                    >
                                        Manage inventory
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <p className="border-t pt-4 text-xs text-muted-foreground">
                    Pharmacy Prescription Dispensing System
                </p>
            </main>
        </AppLayout>
    );
}
