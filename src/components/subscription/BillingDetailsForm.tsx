import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, Building2, User, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { BillingDetails } from '@/features/subscription/types';
import { subscriptionService } from '@/features/subscription/services/subscriptionService';
import { LocationSelector } from './LocationSelector';
import { BillingDetailsList } from './BillingDetailsList'; // This renders a SINGLE item card
import { CompanySearchInput } from './CompanySearchInput';

const billingSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['personal', 'company']),
  firstName: z.string().min(1, 'Prenumele este obligatoriu'),
  lastName: z.string().min(1, 'Numele este obligatoriu'),
  companyName: z.string().optional(),
  cui: z.string().optional(),
  regCom: z.string().optional(),
  address: z.string().min(5, 'Adresa trebuie să fie completă'),
  city: z.string().min(1, 'Orașul este obligatoriu'),
  county: z.string().min(1, 'Județul este obligatoriu'),
  country: z.string().min(1, 'Țara este obligatorie'),
  zipCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'company') {
    if (!data.companyName || data.companyName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Numele companiei este obligatoriu",
        path: ["companyName"]
      });
    }
    if (!data.cui || data.cui.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CUI/CIF este obligatoriu",
        path: ["cui"]
      });
    }
    if (!data.regCom || data.regCom.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nr. Reg. Com. este obligatoriu",
        path: ["regCom"]
      });
    }
  }
});

type BillingFormData = z.infer<typeof billingSchema>;

interface BillingDetailsFormProps {
  initialData?: BillingDetails[] | BillingDetails; // Handle both for compatibility
  onSuccess?: (data: BillingDetails[]) => void;
}

export function BillingDetailsForm({ initialData, onSuccess }: BillingDetailsFormProps) {
  // Normalize initial data to array
  const [billingList, setBillingList] = useState<BillingDetails[]>([]);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null); // If null and viewMode='form', it's adding new

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize state
  useEffect(() => {
    let normalized: BillingDetails[] = [];
    if (Array.isArray(initialData)) {
        normalized = initialData;
    } else if (initialData) {
        normalized = [initialData];
    }
    setBillingList(normalized);
    
    // If no data, default to form view to add first one
    if (normalized.length === 0) {
        setViewMode('form');
    } else {
        setViewMode('list');
    }
  }, [initialData]);

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      type: 'personal',
      firstName: '',
      lastName: '',
      companyName: '',
      cui: '',
      regCom: '',
      address: '',
      city: '',
      county: '',
      country: 'Romania',
      zipCode: '',
    }
  });

  const type = watch('type');

  const startEdit = (details: BillingDetails) => {
      setEditingId(details.id || null); // If no ID, we might have issue matching, but usually we generate one
      // If no ID on existing item, we can try to match by index or just treat as new if we can't identify.
      // But we should ensure ID exists. If not, we can assign temporary one in state.
      
      reset({
        id: details.id,
        type: details.type,
        firstName: details.firstName,
        lastName: details.lastName,
        companyName: details.companyName || '',
        cui: details.cui || '',
        regCom: details.regCom || '',
        address: details.address || '',
        city: details.city || '',
        county: details.county || '',
        country: details.country || 'Romania',
        zipCode: details.zipCode || '',
      });
      setViewMode('form');
  };

  const startAdd = () => {
      setEditingId(null);
      reset({
        type: 'personal',
        firstName: '',
        lastName: '',
        companyName: '',
        cui: '',
        regCom: '',
        address: '',
        city: '',
        county: '',
        country: 'Romania',
        zipCode: '',
      });
      setViewMode('form');
  }

  const handleDelete = async (index: number) => {
      if (!window.confirm('Sigur dorești să ștergi aceste date de facturare?')) return;

      try {
          setIsSaving(true);
          const newList = [...billingList];
          newList.splice(index, 1);
          
          await subscriptionService.updateBillingDetails(newList);
          setBillingList(newList);
          
          toast.success('Datele au fost șterse');
          if (onSuccess) onSuccess(newList);
          
          if (newList.length === 0) {
              setViewMode('form'); // Show form if list empty
          }
      } catch (error) {
          console.error('Error deleting:', error);
          toast.error('Eroare la ștergere');
      } finally {
          setIsSaving(false);
      }
  };

  const onSubmit = async (data: BillingFormData) => {
    setIsSaving(true);
    setSuccessMessage(null);
    
    try {
      // Generate ID if missing
      const dataWithId = {
          ...data,
          id: data.id || crypto.randomUUID()
      };

      let newList = [...billingList];

      if (editingId) {
          // Update existing
          // We match by ID if possible, otherwise rely on what we have (editingId is set from item)
          const idx = newList.findIndex(item => item.id === editingId);
          if (idx >= 0) {
              newList[idx] = dataWithId;
          } else {
             // Fallback if ID mismatch? Just push? Or error?
             // Maybe it was legacy item without ID.
             // If we passed index instead of ID it would be safer for legacy.
             // But for now assume we can find it or it's a new add if somehow lost.
             newList.push(dataWithId);
          }
      } else {
          // Add new
          newList.push(dataWithId);
      }

      await subscriptionService.updateBillingDetails(newList);
      
      setBillingList(newList);
      setSuccessMessage('Datele de facturare au fost salvate!');
      toast.success('Datele de facturare au fost salvate');
      
      if (onSuccess) {
        onSuccess(newList);
      }
      
      // Return to list view
      setViewMode('list');
    } catch (error) {
      console.error('Error saving billing details:', error);
      toast.error('A apărut o eroare la salvarea datelor');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle company selection
  const handleCompanySelect = (company: any) => {
      setValue('companyName', company.name);
      setValue('cui', company.cui); // With RO prefix
      setValue('regCom', company.regCom);
      setValue('address', company.address);
      
      // Attempt to populate location if API returned it
      if (company.county) setValue('county', company.county);
      if (company.city) setValue('city', company.city);
      if (company.zipCode) setValue('zipCode', company.zipCode);
  };

  if (viewMode === 'list' && billingList.length > 0) {
      return (
          <div className="max-w-2xl mx-auto space-y-6">
               {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                    <p className="text-green-700">{successMessage}</p>
                </div>
               )}
              
              <div className="space-y-4">
                  {billingList.map((item, index) => (
                      <BillingDetailsList 
                        key={item.id || index}
                        data={item} 
                        onEdit={() => startEdit(item)}
                        onDelete={() => handleDelete(index)}
                      />
                  ))}
              </div>

              <div className="flex justify-end pt-4">
                  <button 
                    onClick={startAdd}
                    className="flex items-center px-4 py-2 text-sm font-medium text-brand-info bg-brand-info/10 rounded-md hover:bg-brand-info/20 transition-colors"
                  >
                      <Plus className="w-4 h-4 mr-2" />
                      Adaugă noi date de facturare
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {successMessage && viewMode === 'form' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      {/* Back button only if we have a list to go back to */}
      {billingList.length > 0 && viewMode === 'form' && (
          <div className="mb-4">
              <button 
                  type="button"
                  onClick={() => setViewMode('list')} 
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                  &larr; Înapoi la listă
              </button>
          </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tip Client */}
        <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
          <label className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-all ${type === 'personal' ? 'bg-white shadow-sm text-brand-info font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            <input 
              type="radio" 
              value="personal" 
              className="hidden" 
              {...register('type')} 
            />
            <User className="w-4 h-4 mr-2" />
            Persoană Fizică
          </label>
          <label className={`flex items-center justify-center p-3 rounded-md cursor-pointer transition-all ${type === 'company' ? 'bg-white shadow-sm text-brand-info font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            <input 
              type="radio" 
              value="company" 
              className="hidden" 
              {...register('type')} 
            />
            <Building2 className="w-4 h-4 mr-2" />
            Persoană Juridică
          </label>
        </div>

        {/* Date Personale / Reprezentant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prenume
            </label>
            <input
              type="text"
              {...register('firstName')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
              placeholder="Ion"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nume
            </label>
            <input
              type="text"
              {...register('lastName')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
              placeholder="Popescu"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Date Companie (Conditionat) */}
        {type === 'company' && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Date Companie</h3>
            
            {/* CUI Search & Input */}
             <div>
                <CompanySearchInput 
                    onSelect={handleCompanySelect}
                    register={register}
                    setValue={setValue}
                    error={errors.cui?.message}
                    defaultValue={watch('cui')}
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nume Companie
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
                placeholder="SC EXEMPLE SRL"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Reg Com is here, CUI is above */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nr. Reg. Comerțului
                </label>
                <input
                  type="text"
                  {...register('regCom')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-info focus:ring-brand-info sm:text-sm py-2 px-3 border placeholder:text-gray-400"
                  placeholder="J40/123/2024"
                />
                {errors.regCom && (
                  <p className="mt-1 text-sm text-red-600">{errors.regCom.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Adresa Component */}
        <LocationSelector 
            control={control} 
            setValue={setValue} 
            errors={errors} 
            watch={watch}
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-info hover:bg-brand-highlight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-info disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se salvează...
              </>
            ) : (
              'Salvează Datele de Facturare'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
