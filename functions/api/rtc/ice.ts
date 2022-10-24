const TOKEN_EXPIRATION_SECONDS = 4 * 60 * 60;

interface Env {
  XIRSYS_TOKEN: string;
}

// see https://docs.xirsys.com/?pg=api-turn
interface XirsysRequest {
  format: "urls";
  expire: string;
}
interface XirsysResponse {
  v: {
    iceServers: {
      credential?: string;
      urls: string | string[];
      username?: string;
    };
  };
  s: "ok" | "error";
}
export interface IceApiResponse {
  iceServers: XirsysResponse["v"]["iceServers"];
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const body: XirsysRequest = { format: "urls", expire: String(TOKEN_EXPIRATION_SECONDS) };
  const req = await fetch("https://global.xirsys.net/_turn/gridunlock", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Authorization": "Basic " + btoa(env.XIRSYS_TOKEN),
      "Content-Type": "application/json",
    },
  });
  const parsed: XirsysResponse = await req.json();

  if (parsed.s !== "ok") {
    throw new Error("Received invalid response from Xirsys: " + JSON.stringify(parsed));
  }

  const response: IceApiResponse = {
    iceServers: parsed.v.iceServers,
  };
  return new Response(JSON.stringify(response), {
    headers: {
      "cache-control": `public, max-age=${TOKEN_EXPIRATION_SECONDS / 4}`,
    },
  });
};
