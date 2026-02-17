import React from 'react';
import { BillingDetails } from '@/features/subscription/types';
import { Building2, User, MapPin, Edit2, Trash2, Plus } from 'lucide-react';

interface BillingDetailsListProps {
  data: BillingDetails;
  onEdit: () => void;
  onDelete?: () => void;
}

export function BillingDetailsList({ data, onEdit, onDelete }: BillingDetailsListProps) {
  const isCompany = data.type === 'company';

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-gray-900 font-medium">
          {isCompany ? (
            <Building2 className="w-5 h-5 text-brand-info" />
          ) : (
            <User className="w-5 h-5 text-brand-info" />
          )}
          <span>{isCompany ? 'Persoană Juridică' : 'Persoană Fizică'}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-brand-info hover:bg-white rounded-md transition-colors"
            title="Editează"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {onDelete && (
             <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
              title="Șterge"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nume</p>
            <p className="font-medium text-gray-900">
              {isCompany ? data.companyName : `${data.firstName} ${data.lastName}`}
            </p>
          </div>
          
          {isCompany && (
            <>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CUI</p>
                <p className="font-medium text-gray-900">{data.cui}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reg. Com.</p>
                <p className="font-medium text-gray-900">{data.regCom}</p>
              </div>
            </>
          )}

           {!isCompany && (
             <div>
                {/* Placeholder for alignment if needed, or just leave empty */}
             </div>
           )}
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {data.address}
              </p>
              <p>
                {data.city}, {data.county}, {data.country} {data.zipCode && `- ${data.zipCode}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

