import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjoierinfpovmmkveclg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqb2llcmluZnBvdm1ta3ZlY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTI2OTAsImV4cCI6MjA5NDE4ODY5MH0.kXWyHQkDdJ9UfhPQgubIUp-qtrj1v-lJO0YRV7rQZZk';
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT token for teste2024@eventmap.com
const accessToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImEyZDMyYzBlLTc4NTUtNDQyMS1iMGM0LTNlOTIyY2RlYTNiOCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Jqb2llcmluZnBvdm1ta3ZlY2xnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ZTg1YTgyMy04MzYyLTQwOWQtYTJkMC1mNzE3M2YxYTFkMGMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4NjMxNjIxLCJpYXQiOjE3Nzg2MjgwMjEsImVtYWlsIjoidGVzdGUyMDI0QGV2ZW50bWFwLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0ZXN0ZTIwMjRAZXZlbnRtYXAuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNGU4NWE4MjMtODM2Mi00MDlkLWEyZDAtZjcxNzNmMWExZDBjIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3Nzg2MjgwMjF9XSwic2Vzc2lvbl9pZCI6IjNiMTNiYzA5LWNhZjEtNDUwZi05NjQyLTdmYjE1MTlhMzhlYiIsImlzX2Fub255bW91cyI6ZmFsc2V9.PpNWY0ap_zctnPrVYqpkRgmPCdVAPQ4tMjhd7TeNb1UihyvSwPLEk7WBRS9UeEirmSvGpOOn4HnaKTlEa5P5-g';

async function testSave() {
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
  
  const userId = '4e85a823-8362-409d-a2d0-f7173f1a1d0c'; // from the auth response

  console.log('1. Criando evento...');
  const { data: novoEvento, error: createError } = await supabase
    .from('eventos')
    .insert({
      user_id: userId,
      nome: 'Teste de Evento',
      endereco: 'Rua Teste',
      linhas: 17,
      colunas: 11,
      largura_palco: 400,
      altura_palco: 120,
      distancia_mesas: 80,
      espacamento_horizontal: 12
    })
    .select()
    .single();

  if (createError) {
    console.error('Erro ao criar evento:', createError);
    return;
  }

  const currentEventoId = novoEvento.id;
  console.log('Evento criado:', currentEventoId);

  console.log('2. Limpando mesas...');
  const { error: delError } = await supabase.from('mesas').delete().eq('evento_id', currentEventoId);
  if (delError) console.error('Erro ao deletar:', delError);

  console.log('3. Inserindo mesas...');
  const mesasParaSalvar = [
    { evento_id: currentEventoId, numero_mesa: 1, ocupada: true },
    { evento_id: currentEventoId, numero_mesa: 2, ocupada: false }
  ];

  const { error: mesasError } = await supabase.from('mesas').insert(mesasParaSalvar);
  if (mesasError) {
    console.error('Erro ao inserir mesas:', mesasError);
  } else {
    console.log('Mesas inseridas com sucesso!');
  }
}

testSave();
