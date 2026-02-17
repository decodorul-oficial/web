import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Query too short' },
        { status: 400 }
      );
    }

    // Determine if searching by CUI or Name
    const isCui = /^\d+$/.test(query.replace(/RO/i, '').trim());
    const cleanQuery = query.trim();
    
    // Lista Firme API
    const API_BASE_URL = 'https://lista-firme.info/api/v1/info';
    let url = '';

    if (isCui) {
        // Remove 'RO' if present for CUI search just in case, or leave it. 
        // Example used clean CUI. Let's try cleaning it.
        const cleanCui = cleanQuery.toUpperCase().replace('RO', '').replace(/\s/g, '');
        url = `${API_BASE_URL}?cui=${cleanCui}`;
    } else {
        // Name search
        url = `${API_BASE_URL}?name=${encodeURIComponent(cleanQuery)}`;
    }

    // console.log('Fetching company info from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // 'User-Agent': 'Mozilla/5.0 ...' // Sometimes needed
      }
    });

    if (!response.ok) {
        // If 404, just return not found
        if (response.status === 404) {
             return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }
        throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    // The API might return an array or object? 
    // Example provided shows a single object for CUI/Name info.
    // If name search returns multiple, I need to check API behavior. 
    // Usually 'info' endpoint returns details for one entity or match?
    // If it returns list, we'll map map.
    // The example provided shows a SINGLE object response structure.
    // Let's assume it returns one match or null.
    
    const data = await response.json();

    // Check validity
    if (!data || (!data.cui && !data.name)) {
         return NextResponse.json(
            { error: 'No data found' },
            { status: 404 }
        );
    }

    // Normalize Data
    // Example response:
    // {
    //   "name": "R&G PRO AUTOMOTIVE S.R.L.",
    //   "cui": "39696596",
    //   "reg_com": "J40/11018/2018",
    //   "address": { "country": "România", "city": "Bucureşti Sectorul 3", "county": "Bucureşti", ... }
    //   "info": { "address": "...", ... }
    // }

    const addressObj = data.address || {};
    
    // Parse City and County
    // address.city might be "Bucureşti Sectorul 3" or "Cluj-Napoca"
    // address.county might be "Bucureşti" or "Cluj"
    
    let county = addressObj.county || '';
    let city = addressObj.city || '';
    const fullAddress = data.info?.address || '';

    // Fix Diacritics/Formatting if needed (though UTF-8 should handle it)
    // Basic normalization for standard dropdown matching if needed.
    // For now pass as is, but maybe Capitalize.
    
    // Special handling for Bucharest Sectors if needed for dropdown
    // If county is Bucuresti, city often contains Sector.
    if (county.toLowerCase().includes('bucuresti') || county.toLowerCase().includes('bucureşti')) {
        county = 'Bucuresti'; // Standardize for dropdown
        // If city is "Bucureşti Sectorul 3", extract "Sector 3"?
        // Or keep "Bucuresti" as city?
        // My LocationSelector uses "Bucuresti" as county.
        // Cities in Bucharest are usually "Sector 1", "Sector 2"... OR just "Bucuresti" depending on list.
        // Let's try to detect sector.
        if (city.toLowerCase().includes('sector')) {
            const match = city.match(/Sector(?:ul)?\s*(\d+)/i);
            if (match) {
                city = `Sector ${match[1]}`;
            }
        } else if (city.toLowerCase().includes('bucuresti') || city.toLowerCase().includes('bucureşti')) {
             // If just "Bucuresti", maybe default to Sector 1 or leave as "Bucuresti" if dropdown supports it
             city = 'Bucuresti'; 
        }
    } else {
        // Standardize Capitalization for other counties/cities
        // E.g. "TIMIŞ" -> "Timis"? Or keep diacritics?
        // My dropdown likely has standard Romanian names with diacritics or without.
        // I will attempt to match common format (Title Case).
        
        const titleCase = (str: string) => {
            if (!str) return '';
            return str.toLowerCase().replace(/(?:^|\s|-)\S/g, c => c.toUpperCase());
        };

        // If county/city comes in all caps
        if (county === county.toUpperCase()) county = titleCase(county);
        if (city === city.toUpperCase()) city = titleCase(city);
    }

    const result = {
      name: data.name,
      cui: data.cui, // Should ensure RO prefix in frontend or here? Usually frontend expects RO for saving? Or just CUI?
                   // data.cui is "39696596".
      regCom: data.reg_com,
      address: fullAddress.length > 5 ? fullAddress : `${addressObj.street || ''} ${addressObj.number || ''}, ${addressObj.city || ''}, ${addressObj.county || ''}`,
      city: city, 
      county: county,
      country: addressObj.country || 'Romania',
      zipCode: addressObj.postalCode || '',
      fullData: data
    };

    // Return array to match previous structure logic if we want to support multiple results in future
    // But current frontend expects single object in results array for `onSelect`.
    // Wait, frontend `results` state is array. API can return one object or list.
    // I will return single object and frontend wraps in array or I return array.
    // Frontend: `setResults([data])` if single.
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details' },
      { status: 500 }
    );
  }
}
