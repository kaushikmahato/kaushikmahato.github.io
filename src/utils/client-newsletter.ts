import { actions } from "astro:actions";

declare global {
  interface Window {
    turnstile?: { reset?: () => void };
  }
}

const form = document.querySelector<HTMLFormElement>(
  "[data-newsletter-form][data-newsletter-ajax]",
);

if (!form) {
  // (Early return avoids bundling dead logic)
} else {
  const btn = form.querySelector<HTMLButtonElement>("[data-newsletter-btn]");
  const msg = form.querySelector<HTMLElement>("[data-newsletter-msg]");

  const INTENT = {
    success: "text-green-700 dark:text-green-200",
    error: "text-red-700 dark:text-red-300",
  } as const;

  function setIntent(intent: keyof typeof INTENT) {
    if (!msg) return;
    msg.classList.remove(
      ...INTENT.success.split(" "),
      ...INTENT.error.split(" "),
    );
    msg.classList.add(...INTENT[intent].split(" "));
  }

  function setMsg(text: string) {
    if (msg) msg.textContent = text;
  }

  function setPending(p: boolean) {
    if (!btn) return;
    btn.disabled = p;
    btn.setAttribute("aria-busy", String(p));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    setPending(true);
    try {
      const { error } = await actions.newsletterSubscribe(new FormData(form));

      if (error) {
        const code = (error as { code?: string; message?: string }).code;
        const message = (error as { code?: string; message?: string }).message;

        setIntent("error");
        setMsg(
          code === "BAD_REQUEST"
            ? message === "Turnstile verification failed."
              ? "Please complete the Turnstile challenge."
              : "We could not subscribe this email. Please check and try again."
            : "Something went wrong on our side. Please try again later.",
        );
      } else {
        setIntent("success");
        setMsg("Check your inbox to confirm your subscription.");
        form.reset();
        window.turnstile?.reset?.();

        if (btn) {
          const oldText = btn.textContent;
          btn.textContent = "Subscribed!";
          setTimeout(() => {
            btn.textContent = oldText;
          }, 3000);
        }
      }
    } catch {
      setIntent("error");
      setMsg("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  });
}
