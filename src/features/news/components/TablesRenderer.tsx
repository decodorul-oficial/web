"use client";

import React, { useEffect, useMemo, useRef } from 'react';

type TableRow = Record<string, unknown>;

export type ContentTable = {
  tableName: string;
  tableData: TableRow[];
};

export function TablesRenderer({ tables }: { tables: ContentTable[] }) {
  const normalizedTables = useMemo(() => Array.isArray(tables) ? tables : [], [tables]);

  const computeHeaders = (rows: TableRow[]): string[] => {
    const headers: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          headers.push(key);
        }
      }
    }
    return headers;
  };

  const formatCell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    try {
      return String(value);
    } catch {
      return '';
    }
  };

  // Keep refs for each table element and instance for cleanup
  const tableElsRef = useRef<(HTMLTableElement | null)[]>([]);
  const dataTableInstancesRef = useRef<unknown[]>([]);

  const tableOptions = useMemo(() => {
    return (normalizedTables || []).map((t) => {
      const rowCount = (t.tableData || []).length;
      const enablePaging = rowCount > 10;
      return {
        sortable: true,
        searchable: enablePaging,
        paging: enablePaging,
        perPage: 10,
        perPageSelect: [10, 20, 50, 100],
        firstLast: true,
        nextPrev: true,
        // Map classnames to Flowbite's expected selectors
        classes: {
          container: 'datatable-wrapper',
          table: 'datatable-table',
          top: 'datatable-top',
          bottom: 'datatable-bottom',
          search: 'datatable-search',
          searchInput: 'datatable-input',
          selector: 'datatable-selector',
          dropdown: 'datatable-dropdown',
          pagination: 'datatable-pagination',
          paginationList: 'datatable-pagination-list',
          paginationListItem: 'datatable-pagination-list-item',
          paginationListItemLink: 'datatable-pagination-list-item-link',
          info: 'datatable-info'
        },
        layout: {
          top: enablePaging ? '{search}{select}' : '',
          bottom: enablePaging ? '{info}{pager}' : '',
          // When empty string, simple-datatables will not render those containers
        },
        labels: {
          placeholder: 'Caută...',
          perPage: '{select}',
          noRows: 'Nu există date',
          info: 'Afișare {start}–{end} din {rows} rânduri',
        },
      };
    });
  }, [normalizedTables]);

  useEffect(() => {
    let isCancelled = false;
    
    // Only load simple-datatables if we have tables to render
    if (normalizedTables.length === 0) return;
    
    // Dynamic import on client only with better error handling
    import('simple-datatables')
      .then((mod: { DataTable?: unknown }) => {
        if (isCancelled) return;
        const SimpleDataTables = mod?.DataTable ? mod : (window as Record<string, unknown>).simpleDatatables as { DataTable?: unknown };

        // Cleanup any previous instances before creating new ones
        for (const inst of dataTableInstancesRef.current) {
          try { (inst as { destroy?: () => void })?.destroy?.(); } catch {}
        }
        dataTableInstancesRef.current = [];

        (normalizedTables || []).forEach((t, idx) => {
          const tableEl = tableElsRef.current[idx];
          if (!tableEl) return;
          try {
            let instance: unknown;
            if (SimpleDataTables?.DataTable) {
              instance = new (SimpleDataTables.DataTable as new (el: HTMLTableElement, options: unknown) => unknown)(tableEl, tableOptions[idx]);
            } else if (mod?.DataTable) {
              instance = new (mod.DataTable as new (el: HTMLTableElement, options: unknown) => unknown)(tableEl, tableOptions[idx]);
            } else {
              console.warn('DataTable not available');
              return;
            }
            dataTableInstancesRef.current[idx] = instance;

            // Ensure numeric labels are visible by mirroring aria-label to data-page
            try {
              const pager = tableEl.closest('.datatable-wrapper')?.querySelectorAll('.datatable-pagination .datatable-pagination-list-item-link');
              pager?.forEach((btn: Element) => {
                const page = btn?.getAttribute?.('aria-label')?.replace(/\D+/g, '') || '';
                if (page) btn.setAttribute('data-page', page);
              });
            } catch {}
          } catch (e) {
            // swallow to avoid breaking render if library fails
            console.error('Failed to init DataTable', e);
          }
        });
      })
      .catch((e) => {
        console.error('simple-datatables failed to load', e);
      });

    return () => {
      isCancelled = true;
      for (const inst of dataTableInstancesRef.current) {
        try { (inst as { destroy?: () => void })?.destroy?.(); } catch {}
      }
      dataTableInstancesRef.current = [];
    };
    // Re-init when the number of tables or their sizes change
  }, [normalizedTables, tableOptions]);

  if (normalizedTables.length === 0) return null;

  return (
    <section className="space-y-10" aria-label="Tabele extrase din document">
      {normalizedTables.map((table, idx) => {
        const headers = computeHeaders(table.tableData || []);
        return (
          <div key={`${table.tableName}-${idx}`} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{table.tableName}</h2>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table
                ref={(el) => { tableElsRef.current[idx] = el; }}
                id={`content-table-${idx}`}
                className="min-w-full table-auto border-collapse"
              >
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200"
                      >
                        <span className="datatable-sorter flex items-center">
                          {header}
                          <svg
                            className="w-4 h-4 ml-1 text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m8 15 4 4 4-4m0-6-4-4-4 4"
                            />
                          </svg>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(table.tableData || []).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {headers.map((header) => (
                        <td key={header} className="px-4 py-3 align-top text-sm text-gray-800 border-b border-gray-200 whitespace-pre-wrap">
                          {formatCell((row as TableRow)[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}


