export function WhatsAppButton({
  whatsapp,
  brandName,
}: {
  whatsapp: string;
  brandName: string;
}) {
  const message = encodeURIComponent(`Olá! Vim pelo site da ${brandName}.`);
  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25d366] p-3.5 shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white" aria-hidden>
        <path d="M16 2.7C8.7 2.7 2.7 8.6 2.7 16c0 2.3.6 4.6 1.8 6.6L2.7 29.3l6.9-1.8c1.9 1.1 4.1 1.6 6.4 1.6 7.3 0 13.3-5.9 13.3-13.3S23.3 2.7 16 2.7zm0 24.2c-2 0-4-.5-5.7-1.6l-.4-.2-4.1 1.1 1.1-4-.3-.4c-1.1-1.8-1.7-3.9-1.7-6 0-6.1 5-11.1 11.1-11.1s11.1 5 11.1 11.1-5 11.1-11.1 11.1zm6.1-8.3c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.4z" />
      </svg>
    </a>
  );
}
