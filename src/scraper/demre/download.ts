import https from 'node:https';

// shortcut: parser HTTP laxo porque demre.cl envía un encabezado inválido que rechaza fetch; solo para esta descarga pública
export function download(url: string, redirects = 3): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { insecureHTTPParser: true }, (res) => {
        const { statusCode = 0, headers } = res;
        if (statusCode >= 300 && statusCode < 400 && headers.location && redirects > 0) {
          res.resume();
          resolve(download(new URL(headers.location, url).toString(), redirects - 1));
          return;
        }
        if (statusCode !== 200) {
          res.resume();
          reject(new Error(`No se pudo descargar la oferta de DEMRE (HTTP ${statusCode})`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
        res.on('error', reject);
      })
      .on('error', reject)
      .setTimeout(60_000, function (this: ReturnType<typeof https.get>) {
        this.destroy(new Error('Tiempo de espera agotado al descargar desde DEMRE'));
      });
  });
}
