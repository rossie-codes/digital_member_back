// src/wati/get_wati_template_list.ts



import getWatiDetails from '../wati/wati_client';



// const WATI_TOKEN = process.env.WATI_TOKEN;
// const WATI_ENDPOINT = process.env.WATI_ENDPOINT;
// const url = `${WATI_ENDPOINT}/api/v1/getMessageTemplates?pageSize200&pageNumber=1`;

export const getWatiTemplateList = async (): Promise<string[]> => {

  

  const watiDeatil = await getWatiDetails();

  console.log("WATI details is :", watiDeatil);

  const url = `${watiDeatil.wati_api_endpoint}/api/v1/getMessageTemplates?pageSize=200&pageNumber=1`;

  console.log('Fetching WATI template list from:', url);


  const response = await fetch(url, {
    headers: {
      // Authorization: `Bearer ${WATI_TOKEN}`,
      Authorization: `${watiDeatil.wati_access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`WATI API request failed with status ${response.status}`);
  }

  const data = await response.json();

  const templateNames = data.messageTemplates.map((template: any) => template.elementName);

  return templateNames; // Return the array directly
};