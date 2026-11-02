import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, PlusCircle } from 'lucide-react';
import type { SharedData } from '@/types';

interface DispenseItem {
    id: number;
    quantity_dispensed: number;
    unit_price: string;
    total_price: string;
    medicine: {
        id: number;
        medicine_brand: string;
        generic_name: string;
        medicine_sku: string;
    };
}

interface DispenseRecord {
    id: number;
    dispense_date: string;
    patient: { id: number; patient_name: string };
    doctor: { id: number; doctor_name: string; doctor_license_no: string };
    items: DispenseItem[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface RecordPage {
    data: DispenseRecord[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

const numberFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DispensingIndex({ records }: { records: RecordPage }) {
    const { flash } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dispensing Records', href: route('dispense-records.index') }]}>
            <Head title="Dispensing Records" />
            <main className="space-y-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Patient care</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dispensing Records</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Review dispensed medicines, patients, prescribers, and totals.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('dispense-records.create')}><PlusCircle /> New dispensing record</Link>
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        {flash.success && (
                            <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                                {flash.success}
                            </div>
                        )}
                        {records.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
                                <ClipboardList className="mx-auto size-9 text-muted-foreground" />
                                <h2 className="mt-4 font-semibold">No dispensing records yet</h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">When a prescription is dispensed, its patient, doctor, medicines, and total will be listed here.</p>
                                <Button className="mt-5" asChild><Link href={route('dispense-records.create')}><PlusCircle /> Create a record</Link></Button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[880px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                                                <th className="px-3 py-3 font-medium">Record</th>
                                                <th className="px-3 py-3 font-medium">Patient</th>
                                                <th className="px-3 py-3 font-medium">Doctor</th>
                                                <th className="px-3 py-3 font-medium">Medicines dispensed</th>
                                                <th className="px-3 py-3 font-medium">Total</th>
                                                <th className="px-3 py-3 text-right font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {records.data.map((record) => {
                                                const total = record.items.reduce((sum, item) => sum + Number(item.total_price), 0);

                                                return (
                                                    <tr key={record.id} className="align-top hover:bg-muted/30">
                                                        <td className="px-3 py-4">
                                                            <p className="font-medium">#{record.id}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">{record.dispense_date}</p>
                                                        </td>
                                                        <td className="px-3 py-4 font-medium">{record.patient.patient_name}</td>
                                                        <td className="px-3 py-4">
                                                            <p className="font-medium">{record.doctor.doctor_name}</p>
                                                            <p className="mt-1 font-mono text-xs text-muted-foreground">{record.doctor.doctor_license_no}</p>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <ul className="space-y-1.5">
                                                                {record.items.map((item) => (
                                                                    <li key={item.id}>
                                                                        <span className="font-medium">{item.medicine.medicine_brand}</span>
                                                                        <span className="text-muted-foreground"> · {item.quantity_dispensed} × {numberFormat.format(Number(item.unit_price))}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                        <td className="px-3 py-4 font-semibold tabular-nums">{numberFormat.format(total)}</td>
                                                        <td className="px-3 py-4 text-right">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={route('dispense-records.edit', record.id)}>Edit</Link>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {records.data.length} of {records.total} records
                                    </p>
                                    {records.last_page > 1 && (
                                        <nav className="flex flex-wrap gap-1" aria-label="Dispensing record pages">
                                            {records.links.map((link, index) => link.url ? (
                                                <Link
                                                    key={`${link.label}-${index}`}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={`${link.label}-${index}`}
                                                    className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
