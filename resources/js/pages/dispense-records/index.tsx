import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
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
    from: number | null;
    links: PaginationLink[];
}

interface DispensingIndexProps {
    records: RecordPage;
    search: string;
}

const numberFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default function DispensingIndex({ records, search }: DispensingIndexProps) {
    const [query, setQuery] = useState(search);
    const [deleteTarget, setDeleteTarget] = useState<DispenseRecord | null>(null);
    const { flash } = usePage<SharedData>().props;
    const { delete: destroy, processing: deleting } = useForm();

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            route('dispense-records.index'),
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    function handleDelete() {
        if (!deleteTarget) return;
        destroy(route('dispense-records.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
            onError: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dispensing Records', href: route('dispense-records.index') }]}>
            <Head title="Dispensing Records" />

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete dispensing record?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Record <strong>#{deleteTarget?.id}</strong> for{' '}
                            <strong>{deleteTarget?.patient.patient_name}</strong> on{' '}
                            <strong>{deleteTarget?.dispense_date}</strong> will be removed from
                            the active list. Dispensing items and medicine inventory will not be
                            affected. This action can be undone by an administrator from the
                            database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting…' : 'Delete record'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <main className="space-y-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Patient care</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            Dispensing Records
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review dispensed medicines, patients, prescribers, and totals.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('dispense-records.create')}>
                            <PlusCircle /> New dispensing record
                        </Link>
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        {flash.success && (
                            <div
                                role="status"
                                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
                            >
                                {flash.success}
                            </div>
                        )}

                        {/* Search */}
                        <form onSubmit={submitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <Input
                                    aria-label="Search dispensing records"
                                    className="pl-9"
                                    placeholder="Search by patient, doctor, medicine, or date (YYYY-MM-DD)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Search
                            </Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setQuery('');
                                        router.get(
                                            route('dispense-records.index'),
                                            {},
                                            { preserveState: true, replace: true },
                                        );
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>

                        {records.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
                                <ClipboardList className="mx-auto size-9 text-muted-foreground" />
                                <h2 className="mt-4 font-semibold">
                                    {search ? 'No matching records' : 'No dispensing records yet'}
                                </h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    {search
                                        ? 'Try searching by patient name, doctor name, medicine name, or date.'
                                        : 'When a prescription is dispensed, its patient, doctor, medicines, and total will be listed here.'}
                                </p>
                                {!search && (
                                    <Button className="mt-5" asChild>
                                        <Link href={route('dispense-records.create')}>
                                            <PlusCircle /> Create a record
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                <th className="px-3 py-3">#</th>
                                                <th className="px-3 py-3">Date</th>
                                                <th className="px-3 py-3">Patient</th>
                                                <th className="px-3 py-3">Doctor</th>
                                                <th className="px-3 py-3">Medicines dispensed</th>
                                                <th className="px-3 py-3 text-right">Total</th>
                                                <th className="px-3 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {records.data.map((record, index) => {
                                                const total = record.items.reduce(
                                                    (sum, item) => sum + Number(item.total_price),
                                                    0,
                                                );
                                                const rowNumber =
                                                    (records.from ?? 1) + index;

                                                return (
                                                    <tr
                                                        key={record.id}
                                                        className="align-top hover:bg-muted/30"
                                                    >
                                                        <td className="px-3 py-3.5 text-muted-foreground tabular-nums">
                                                            {rowNumber}
                                                        </td>
                                                        <td className="px-3 py-3.5 tabular-nums text-muted-foreground">
                                                            {record.dispense_date}
                                                        </td>
                                                        <td className="px-3 py-3.5 font-medium">
                                                            {record.patient.patient_name}
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <p className="font-medium">
                                                                {record.doctor.doctor_name}
                                                            </p>
                                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                                {record.doctor.doctor_license_no}
                                                            </p>
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <ul className="space-y-1">
                                                                {record.items.map((item) => (
                                                                    <li key={item.id}>
                                                                        <span className="font-medium">
                                                                            {item.medicine.medicine_brand}
                                                                        </span>
                                                                        <span className="text-muted-foreground">
                                                                            {' · '}
                                                                            {item.quantity_dispensed} ×{' '}
                                                                            {numberFormat.format(
                                                                                Number(item.unit_price),
                                                                            )}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                        <td className="px-3 py-3.5 text-right font-semibold tabular-nums">
                                                            {numberFormat.format(total)}
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'dispense-records.edit',
                                                                            record.id,
                                                                        )}
                                                                    >
                                                                        <Pencil className="size-3.5" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10"
                                                                    onClick={() =>
                                                                        setDeleteTarget(record)
                                                                    }
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {records.data.length} of {records.total} record
                                        {records.total !== 1 ? 's' : ''}
                                        {search && (
                                            <span className="ml-1 text-muted-foreground/70">
                                                matching "{search}"
                                            </span>
                                        )}
                                    </p>
                                    {records.last_page > 1 && (
                                        <nav
                                            className="flex flex-wrap gap-1"
                                            aria-label="Dispensing record pages"
                                        >
                                            {records.links.map((link, i) =>
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                                            link.active
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'bg-background text-foreground hover:bg-muted'
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50"
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ),
                                            )}
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
