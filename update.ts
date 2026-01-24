
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

export type UpdateInfo = {
  versionCode: number;
  versionName: string;
  apkUrl: string;
};

const VERSION_JSON_URL =
  "https://raw.githubusercontent.com/amorim220-design/manuten-ao/main/version.json";

export async function getCurrentVersionCode(): Promise<number> {
  const info = await App.getInfo();
  // No Android, "build" costuma ser o versionCode
  const code = Number(info.build ?? 0);
  return Number.isFinite(code) ? code : 0;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const current = await getCurrentVersionCode();

  // evita cache
  const res = await fetch(`${VERSION_JSON_URL}?t=${Date.now()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Falha ao buscar version.json: ${res.status}`);

  const data = (await res.json()) as Partial<UpdateInfo>;

  if (
    typeof data.versionCode !== "number" ||
    typeof data.versionName !== "string" ||
    typeof data.apkUrl !== "string"
  ) {
    throw new Error("version.json inválido.");
  }

  if (data.versionCode > current) return data as UpdateInfo;
  return null;
}

export async function startUpdate(apkUrl: string) {
  // Abre no navegador do sistema (o Android baixa e inicia instalador)
  await Browser.open({ url: `${apkUrl}?t=${Date.now()}` });
}
