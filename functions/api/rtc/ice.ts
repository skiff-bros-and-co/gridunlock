interface Env {
  XIRSYS_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const response = await fetch("https://global.xirsys.net/_turn/gridunlock", {
    method: "PUT",
    body: JSON.stringify({ format: "urls" }),
    headers: {
      "Authorization": "Basic " + btoa(env.XIRSYS_TOKEN),
      "Content-Type": "application/json",
    },
  });

  return new Response(await response.text());
};
