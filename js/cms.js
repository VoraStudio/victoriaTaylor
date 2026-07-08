/* ----- INICI SECCIÓ CONFIGURACIÓ CMS ----- */
/* URL base del CMS (VoraCMS Symfony). Canvia aquí per apuntar a un altre servidor. */
const CMS_URL = "http://127.0.0.1:8000";
const CMS_API_TOKEN = "UJIv45gTpMGckBdJjDg3UmkuqZzOWqHV";

/* ----- INICI SECCIÓ RESOLUCIÓ D'IMATGES ----- */
/* Converteix rutes relatives del CMS en URLs absolutes. Si la ruta ja és absoluta (http), la retorna tal qual. */
function getVoraMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return CMS_URL + path;
}

/* ----- INICI SECCIÓ PETICIÓ AL CMS ----- */
/* Fetch genèric al CMS: rep un endpoint (ex: /api/noticia), fa GET a CMS_URL + endpoint i retorna el JSON. */
/* En cas d'error, loggeja i retorna null per no trencar la pàgina. */
async function getCMSData(url) {
  try {
    const response = await fetch(`${CMS_URL}${url}`, {
      headers: { 'Authorization': 'Bearer ' + CMS_API_TOKEN }
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
