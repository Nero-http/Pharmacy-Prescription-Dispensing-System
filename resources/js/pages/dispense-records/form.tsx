import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    ChevronsUpDown,
    Pencil,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

interface Patient {
    id: number;
    patient_name: string;
}

interface Doctor {
    id: number;
    doctor_name: string;
    doctor_license_no: string;
}

interface Medicine {
    id: number;
    medicine_sku: string;
    medicine_brand: string;
    generic_name: string;
    dosage_mg: number;
    dosage_form: string | null;
    stock_quantity: number;
    unit_price: string;
    deleted_at?: string | null;
}

interface ExistingItem {
    medicine_id: number;
    quantity_dispensed: number;
}

interface ExistingRecord {
    id: number;
    patient_id: number;
    doctor_id: number;
    dispense_date: string;
    items: ExistingItem[];
}

interface ItemFormData {
    [key: string]: string;
    medicine_id: string;
    quantity_dispensed: string;
}

interface DispenseFormData {
    [key: string]: string | ItemFormData[];
    patient_id: string;
    doctor_id: string;
    dispense_date: string;
    items: ItemFormData[];
}

interface DispenseFormProps {
    patients: Patient[];
    doctors: Doctor[];
    medicines: Medicine[];
    record: ExistingRecord | null;
    minDispenseDate: string;
    maxDispenseDate: string;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return (
        <Label htmlFor={htmlFor}>
            {children} <span className="text-destructive" aria-label="required">*</span>
        </Label>
    );
}

interface PersonOption {
    id: number;
    label: string;
    description?: string;
}

interface PersonComboboxProps {
    id: string;
    label: string;
    value: string;
    options: PersonOption[];
    placeholder: string;
    emptyMessage: string;
    invalid: boolean;
    onValueChange: (value: string) => void;
}

function PersonCombobox({
    id,
    label,
    value,
    options,
    placeholder,
    emptyMessage,
    invalid,
    onValueChange,
}: PersonComboboxProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const selectedOption = options.find((option) => String(option.id) === value);
    const inputValue = isOpen
        ? isTyping
            ? query
            : selectedOption?.label ?? ''
        : selectedOption?.label ?? query;
    const searchQuery = isOpen && isTyping ? query.trim().toLocaleLowerCase() : '';
    const filteredOptions = options.filter((option) =>
        `${option.label} ${option.description ?? ''}`
            .toLocaleLowerCase()
            .includes(searchQuery),
    );
    const listboxId = `${id}-options`;

    function selectOption(option: PersonOption) {
        onValueChange(String(option.id));
        setQuery('');
        setIsTyping(false);
        setIsOpen(false);
        setActiveIndex(0);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setActiveIndex(0);
            } else {
                setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setActiveIndex(0);
            } else {
                setActiveIndex((index) => Math.max(index - 1, 0));
            }
        } else if (event.key === 'Enter' && isOpen) {
            event.preventDefault();
            const option = filteredOptions[activeIndex];
            if (option) selectOption(option);
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }

    return (
        <div className="relative min-w-0 flex-1">
            <Input
                id={id}
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={
                    isOpen && filteredOptions[activeIndex]
                        ? `${id}-option-${filteredOptions[activeIndex].id}`
                        : undefined
                }
                aria-invalid={invalid}
                autoComplete="off"
                placeholder={placeholder}
                value={inputValue}
                className="pr-9"
                onFocus={() => {
                    setIsOpen(true);
                    setIsTyping(false);
                    setQuery('');
                    setActiveIndex(0);
                }}
                onBlur={() => setIsOpen(false)}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setIsTyping(true);
                    setIsOpen(true);
                    setActiveIndex(0);
                    onValueChange('');
                }}
                onKeyDown={handleKeyDown}
            />
            <ChevronsUpDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label={`${label} options`}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const selected = String(option.id) === value;
                            return (
                                <button
                                    key={option.id}
                                    id={`${id}-option-${option.id}`}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    tabIndex={-1}
                                    className={`flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm ${
                                        index === activeIndex
                                            ? 'bg-accent text-accent-foreground'
                                            : ''
                                    }`}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseMove={() => setActiveIndex(index)}
                                    onClick={() => selectOption(option)}
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {option.label}
                                        {option.description && (
                                            <span className="ml-2 text-muted-foreground">
                                                {option.description}
                                            </span>
                                        )}
                                    </span>
                                    {selected && (
                                        <Check aria-hidden="true" className="size-4 shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <p role="status" className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {searchQuery
                                ? `No ${label.toLocaleLowerCase()} match "${query}".`
                                : emptyMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DispenseForm({
    patients,
    doctors,
    medicines,
    record,
    minDispenseDate,
    maxDispenseDate,
}: DispenseFormProps) {
    const editing = record !== null;
    const [patientOptions, setPatientOptions] = useState(patients);
    const [doctorOptions, setDoctorOptions] = useState(doctors);
    const [patientDialogOpen, setPatientDialogOpen] = useState(false);
    const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [patientName, setPatientName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorLicense, setDoctorLicense] = useState('');
    const [personErrors, setPersonErrors] = useState<Record<string, string>>({});
    const [personProcessing, setPersonProcessing] = useState(false);
    const patientComboboxOptions = useMemo(
        () =>
            patientOptions.map((patient) => ({
                id: patient.id,
                label: patient.patient_name,
            })),
        [patientOptions],
    );
    const doctorComboboxOptions = useMemo(
        () =>
            doctorOptions.map((doctor) => ({
                id: doctor.id,
                label: doctor.doctor_name,
                description: doctor.doctor_license_no,
            })),
        [doctorOptions],
    );

    const { data, setData, post, put, processing, errors } = useForm<DispenseFormData>({
        patient_id:
            record && patients.some((patient) => patient.id === record.patient_id)
                ? String(record.patient_id)
                : '',
        doctor_id:
            record && doctors.some((doctor) => doctor.id === record.doctor_id)
                ? String(record.doctor_id)
                : '',
        dispense_date: record?.dispense_date ?? minDispenseDate,
        items:
            record?.items.map((item) => ({
                medicine_id: String(item.medicine_id),
                quantity_dispensed: String(item.quantity_dispensed),
            })) ?? [{ medicine_id: '', quantity_dispensed: '1' }],
    });

    const total = useMemo(
        () =>
            data.items.reduce((sum, item) => {
                const medicine = medicines.find((m) => String(m.id) === item.medicine_id);
                const quantity = Number(item.quantity_dispensed);
                return sum + (medicine && Number.isFinite(quantity) ? Number(medicine.unit_price) * quantity : 0);
            }, 0),
        [data.items, medicines],
    );

    function updateItem(index: number, patch: Partial<ItemFormData>) {
        setData(
            'items',
            data.items.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          medicine_id: patch.medicine_id ?? item.medicine_id,
                          quantity_dispensed: patch.quantity_dispensed ?? item.quantity_dispensed,
                      }
                    : item,
            ),
        );
    }

    function availableStock(medicine: Medicine) {
        const previousQuantity =
            record?.items
                .filter((item) => item.medicine_id === medicine.id)
                .reduce((sum, item) => sum + item.quantity_dispensed, 0) ?? 0;
        return medicine.stock_quantity + previousQuantity;
    }

    function fieldError(key: string) {
        return Object.entries(errors).find(([name]) => name === key)?.[1];
    }

    function openNewPatient() {
        setEditingPatient(null);
        setPatientName('');
        setPersonErrors({});
        setPatientDialogOpen(true);
    }

    function openEditPatient(patient: Patient) {
        setEditingPatient(patient);
        setPatientName(patient.patient_name);
        setPersonErrors({});
        setPatientDialogOpen(true);
    }

    function openNewDoctor() {
        setEditingDoctor(null);
        setDoctorName('');
        setDoctorLicense('');
        setPersonErrors({});
        setDoctorDialogOpen(true);
    }

    function openEditDoctor(doctor: Doctor) {
        setEditingDoctor(doctor);
        setDoctorName(doctor.doctor_name);
        setDoctorLicense(doctor.doctor_license_no);
        setPersonErrors({});
        setDoctorDialogOpen(true);
    }

    async function savePerson(
        url: string,
        method: 'POST' | 'PUT',
        payload: Record<string, string>,
        type: 'patient' | 'doctor',
    ) {
        setPersonProcessing(true);
        setPersonErrors({});
        const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
                body: JSON.stringify(payload),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                const validationErrors = result.errors ?? {};
                const hasValidationErrors = Object.keys(validationErrors).length > 0;
                setPersonErrors(
                    Object.fromEntries(
                        Object.entries(validationErrors).map(([key, value]) => [
                            key,
                            Array.isArray(value) ? value[0] : String(value),
                        ]),
                    ) as Record<string, string>,
                );
                if (!hasValidationErrors) {
                    setPersonErrors({
                        general:
                            typeof result.message === 'string'
                                ? result.message
                                : 'Unable to save the record. Please try again.',
                    });
                }
                return;
            }

            if (type === 'patient') {
                const patient = result.patient as Patient;
                setPatientOptions((current) => {
                    const exists = current.some((item) => item.id === patient.id);
                    const next = exists
                        ? current.map((item) => (item.id === patient.id ? patient : item))
                        : [...current, patient];
                    return next.sort((a, b) => a.patient_name.localeCompare(b.patient_name));
                });
                setData('patient_id', String(patient.id));
                setPatientDialogOpen(false);
            } else {
                const doctor = result.doctor as Doctor;
                setDoctorOptions((current) => {
                    const exists = current.some((item) => item.id === doctor.id);
                    const next = exists
                        ? current.map((item) => (item.id === doctor.id ? doctor : item))
                        : [...current, doctor];
                    return next.sort((a, b) => a.doctor_name.localeCompare(b.doctor_name));
                });
                setData('doctor_id', String(doctor.id));
                setDoctorDialogOpen(false);
            }
        } catch {
            setPersonErrors({ general: 'Unable to save the record. Please try again.' });
        } finally {
            setPersonProcessing(false);
        }
    }

    function submitPatient(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void savePerson(
            editingPatient ? route('patients.update', editingPatient.id) : route('patients.store'),
            editingPatient ? 'PUT' : 'POST',
            { patient_name: patientName },
            'patient',
        );
    }

    function submitDoctor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void savePerson(
            editingDoctor ? route('doctors.update', editingDoctor.id) : route('doctors.store'),
            editingDoctor ? 'PUT' : 'POST',
            { doctor_name: doctorName, doctor_license_no: doctorLicense },
            'doctor',
        );
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (
            processing ||
            (data.dispense_date &&
                (data.dispense_date < minDispenseDate || data.dispense_date > maxDispenseDate))
        ) {
            return;
        }

        if (editing) {
            put(route('dispense-records.update', record.id));
        } else {
            post(route('dispense-records.store'));
        }
    }

    const title = editing ? 'Edit dispensing record' : 'Dispense medicine';
    const missingPeople = patientOptions.length === 0 || doctorOptions.length === 0;
    const noAvailableMedicine = medicines.every((medicine) => availableStock(medicine) === 0);
    const dispenseDateOutOfRange =
        data.dispense_date !== '' &&
        (data.dispense_date < minDispenseDate || data.dispense_date > maxDispenseDate);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dispensing Records', href: route('dispense-records.index') },
                {
                    title,
                    href: editing
                        ? route('dispense-records.edit', record.id)
                        : route('dispense-records.create'),
                },
            ]}
        >
            <Head title={title} />
            <main className="ppds-page ppds-dispense-page">
                <div>
                    <Button variant="ghost" size="sm" className="-ml-3 mb-3" asChild>
                        <Link href={route('dispense-records.index')}>
                            <ArrowLeft /> Back to dispensing records
                        </Link>
                    </Button>
                    <p className="text-sm font-medium text-primary">Prescription dispensing</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Record patient and prescriber details, then select medicines and quantities.
                    </p>
                </div>

                {(missingPeople || noAvailableMedicine) && (
                    <div
                        role="status"
                        className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
                    >
                        <AlertCircle className="mt-0.5 size-5 shrink-0" />
                        <p>
                            {missingPeople &&
                                'At least one patient and one doctor must be registered before dispensing. '}
                            {noAvailableMedicine &&
                                'There are no medicines with available stock to dispense.'}
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Prescription details</CardTitle>
                            <CardDescription>
                                Choose the patient and prescribing doctor for this record.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_14rem]">
                            {/* Patient */}
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="patient_id">Patient</RequiredLabel>
                                <div className="flex gap-2">
                                    <PersonCombobox
                                        id="patient_id"
                                        label="Patient"
                                        value={data.patient_id}
                                        options={patientComboboxOptions}
                                        placeholder="Search patients..."
                                        emptyMessage="No patients are available."
                                        invalid={Boolean(errors.patient_id)}
                                        onValueChange={(value) => setData('patient_id', value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const patient = patientOptions.find(
                                                (option) => String(option.id) === data.patient_id,
                                            );
                                            if (patient) openEditPatient(patient);
                                        }}
                                        disabled={!data.patient_id}
                                        title="Edit selected patient"
                                    >
                                        <Pencil />
                                        <span className="sr-only">Edit selected patient</span>
                                    </Button>
                                    <Button type="button" variant="outline" onClick={openNewPatient}>
                                        <Plus /> Add
                                    </Button>
                                </div>
                                <InputError message={errors.patient_id} />
                            </div>

                            {/* Doctor */}
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="doctor_id">Doctor</RequiredLabel>
                                <div className="flex gap-2">
                                    <PersonCombobox
                                        id="doctor_id"
                                        label="Doctor"
                                        value={data.doctor_id}
                                        options={doctorComboboxOptions}
                                        placeholder="Search doctors..."
                                        emptyMessage="No doctors are available."
                                        invalid={Boolean(errors.doctor_id)}
                                        onValueChange={(value) => setData('doctor_id', value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const doctor = doctorOptions.find(
                                                (option) => String(option.id) === data.doctor_id,
                                            );
                                            if (doctor) openEditDoctor(doctor);
                                        }}
                                        disabled={!data.doctor_id}
                                        title="Edit selected doctor"
                                    >
                                        <Pencil />
                                        <span className="sr-only">Edit selected doctor</span>
                                    </Button>
                                    <Button type="button" variant="outline" onClick={openNewDoctor}>
                                        <Plus /> Add
                                    </Button>
                                </div>
                                <InputError message={errors.doctor_id} />
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <RequiredLabel htmlFor="dispense_date">Dispensing date</RequiredLabel>
                                <Input
                                    id="dispense_date"
                                    type="date"
                                    className="dispense-date-input w-fit max-w-full"
                                    min={minDispenseDate}
                                    max={maxDispenseDate}
                                    required
                                    aria-invalid={
                                        dispenseDateOutOfRange || Boolean(errors.dispense_date)
                                    }
                                    value={data.dispense_date}
                                    onChange={(event) =>
                                        setData('dispense_date', event.target.value)
                                    }
                                />
                                <InputError
                                    message={
                                        dispenseDateOutOfRange
                                            ? `Choose a date between ${minDispenseDate} and ${maxDispenseDate}.`
                                            : errors.dispense_date
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Medicines</CardTitle>
                            <CardDescription>
                                Available stock is checked again by the server before stock is deducted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {data.items.map((item, index) => {
                                const selectedMedicine = medicines.find(
                                    (m) => String(m.id) === item.medicine_id,
                                );
                                const available = selectedMedicine
                                    ? availableStock(selectedMedicine)
                                    : 0;
                                const otherSelectedIds = data.items
                                    .filter((_, i) => i !== index)
                                    .map((other) => other.medicine_id);

                                return (
                                    <div
                                        key={index}
                                        className="rounded-lg border bg-background p-4 md:p-5"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="text-sm font-semibold">
                                                Medicine {index + 1}
                                            </p>
                                            {data.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setData(
                                                            'items',
                                                            data.items.filter((_, i) => i !== index),
                                                        )
                                                    }
                                                >
                                                    <Trash2 /> Remove
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid gap-5 md:grid-cols-[1fr_180px]">
                                            <div className="space-y-2">
                                                <RequiredLabel htmlFor={`medicine-${index}`}>
                                                    Medicine
                                                </RequiredLabel>
                                                <Select
                                                    value={item.medicine_id}
                                                    onValueChange={(value) =>
                                                        updateItem(index, {
                                                            medicine_id: value,
                                                            quantity_dispensed:
                                                                item.quantity_dispensed || '1',
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id={`medicine-${index}`}
                                                        aria-label={`Medicine ${index + 1}`}
                                                    >
                                                        <SelectValue placeholder="Select a medicine" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {medicines.map((medicine) => {
                                                            const stock = availableStock(medicine);
                                                            const disabled =
                                                                stock < 1 ||
                                                                otherSelectedIds.includes(
                                                                    String(medicine.id),
                                                                ) ||
                                                                (Boolean(medicine.deleted_at) &&
                                                                    !record?.items.some(
                                                                        (existingItem) =>
                                                                            existingItem.medicine_id ===
                                                                            medicine.id,
                                                                    ));
                                                            return (
                                                                <SelectItem
                                                                    key={medicine.id}
                                                                    value={String(medicine.id)}
                                                                    disabled={disabled}
                                                                >
                                                                    {medicine.medicine_brand}
                                                                    {medicine.dosage_form
                                                                        ? ` · ${medicine.dosage_form}`
                                                                        : ''}{' '}
                                                                    · {medicine.dosage_mg} mg ·{' '}
                                                                    {stock} available
                                                                    {medicine.deleted_at
                                                                        ? ' · Archived'
                                                                        : ''}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={fieldError(
                                                        `items.${index}.medicine_id`,
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <RequiredLabel htmlFor={`quantity-${index}`}>
                                                    Quantity
                                                </RequiredLabel>
                                                <Input
                                                    id={`quantity-${index}`}
                                                    type="number"
                                                    inputMode="numeric"
                                                    min="1"
                                                    max={
                                                        selectedMedicine ? available : undefined
                                                    }
                                                    step="1"
                                                    required
                                                    value={item.quantity_dispensed}
                                                    onChange={(event) =>
                                                        updateItem(index, {
                                                            quantity_dispensed: event.target.value,
                                                        })
                                                    }
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedMedicine
                                                        ? `${available} unit${available === 1 ? '' : 's'} available`
                                                        : 'Select a medicine to view stock.'}
                                                </p>
                                                <InputError
                                                    message={fieldError(
                                                        `items.${index}.quantity_dispensed`,
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        {selectedMedicine && (
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm">
                                                <span className="text-muted-foreground">
                                                    {selectedMedicine.generic_name}
                                                    {selectedMedicine.dosage_form
                                                        ? ` · ${selectedMedicine.dosage_form}`
                                                        : ''}{' '}
                                                    · {selectedMedicine.dosage_mg} mg · SKU{' '}
                                                    {selectedMedicine.medicine_sku} ·{' '}
                                                    {Number(selectedMedicine.unit_price).toFixed(2)}{' '}
                                                    per unit
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    Line total:{' '}
                                                    {(
                                                        Number(selectedMedicine.unit_price) *
                                                        Number(item.quantity_dispensed || 0)
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <InputError message={errors.items} />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setData('items', [
                                        ...data.items,
                                        { medicine_id: '', quantity_dispensed: '1' },
                                    ])
                                }
                            >
                                <Plus /> Add another medicine
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-primary/20 bg-primary/[0.03] shadow-sm">
                        <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Estimated total</p>
                                <p className="text-2xl font-semibold tabular-nums">
                                    {total.toFixed(2)}
                                </p>
                            </div>
                            <p className="max-w-md text-xs text-muted-foreground">
                                The final total uses the current medicine prices at the time this
                                record is saved.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('dispense-records.index')}>Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || missingPeople || noAvailableMedicine}
                        >
                            <Save />{' '}
                            {processing
                                ? 'Saving…'
                                : editing
                                  ? 'Save record'
                                  : 'Complete dispensing'}
                        </Button>
                    </div>
                </form>
            </main>

            {/* Add / Edit Patient dialog */}
            <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
                <DialogContent>
                    <form onSubmit={submitPatient} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPatient ? 'Edit patient' : 'Add new patient'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingPatient
                                    ? 'Update this patient without affecting existing dispensing records.'
                                    : 'Register a patient and select them for this dispensing record.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="dialog_patient_name">Patient name</RequiredLabel>
                            <Input
                                id="dialog_patient_name"
                                value={patientName}
                                onChange={(event) => setPatientName(event.target.value)}
                                maxLength={255}
                                autoFocus
                            />
                            <InputError message={personErrors.patient_name} />
                        </div>
                        <InputError message={personErrors.general} />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPatientDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={personProcessing}>
                                <Save /> {personProcessing ? 'Saving…' : 'Save patient'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add / Edit Doctor dialog */}
            <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
                <DialogContent>
                    <form onSubmit={submitDoctor} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>
                                {editingDoctor ? 'Edit doctor' : 'Add new doctor'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingDoctor
                                    ? 'Update this doctor without affecting existing dispensing records.'
                                    : 'Register a doctor and select them for this dispensing record.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="dialog_doctor_name">
                                    Doctor name
                                </RequiredLabel>
                                <Input
                                    id="dialog_doctor_name"
                                    value={doctorName}
                                    onChange={(event) => setDoctorName(event.target.value)}
                                    maxLength={255}
                                    autoFocus
                                />
                                <InputError message={personErrors.doctor_name} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="dialog_doctor_license">
                                    License number
                                </RequiredLabel>
                                <Input
                                    id="dialog_doctor_license"
                                    value={doctorLicense}
                                    onChange={(event) =>
                                        setDoctorLicense(event.target.value.toUpperCase())
                                    }
                                    maxLength={255}
                                />
                                <InputError message={personErrors.doctor_license_no} />
                            </div>
                            <InputError message={personErrors.general} />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDoctorDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={personProcessing}>
                                <Save /> {personProcessing ? 'Saving…' : 'Save doctor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
