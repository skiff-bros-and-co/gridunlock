const TOKEN_EXPIRATION_SECONDS = 4 * 60 * 60;

interface Env {
  XIRSYS_TOKEN: string;
}

// see https://docs.xirsys.com/?pg=api-turn
interface XirsysRequest {
  format: "urls";
  expire: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const request: XirsysRequest = { format: "urls", expire: String(TOKEN_EXPIRATION_SECONDS) };
  const response = await fetch("https://global.xirsys.net/_turn/gridunlock", {
    method: "PUT",
    body: JSON.stringify(request),
    headers: {
      "Authorization": "Basic " + btoa(env.XIRSYS_TOKEN),
      "Content-Type": "application/json",
    },
  });

  return new Response(await response.text(), {
    headers: {
      "cache-control": `public, max-age=${TOKEN_EXPIRATION_SECONDS / 4}`,
    },
  });
};
