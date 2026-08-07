"use client";

import { FormEvent, MouseEvent, useRef } from "react";

const CONTACT_EMAIL = "bitibolji4@gmail.com";

export function ContactModal({ locale = "hr" }: { locale?: "hr" | "en" }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const english = locale === "en";

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeModal();
  }

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const topic = String(formData.get("topic") ?? (english ? "Collaboration" : "Suradnja"));
    const message = String(formData.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Biti bolji — ${topic}`);
    const body = encodeURIComponent(`${english ? "Hello" : "Pozdrav"} Vlado,\n\n${message}\n\n${name}`);

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    closeModal();
  }

  return (
    <>
      <button className="button button--dark contact-button" type="button" onClick={openModal}>
        {english ? "Send an email" : "Pošalji email poruku"} <span aria-hidden="true">→</span>
      </button>

      <dialog
        aria-labelledby="contact-modal-title"
        className="contact-modal"
        onClick={closeOnBackdrop}
        ref={dialogRef}
      >
        <div className="contact-modal-inner">
          <button className="contact-modal-close" type="button" onClick={closeModal} aria-label={english ? "Close contact form" : "Zatvori kontakt obrazac"}>
            ×
          </button>

          <div className="contact-modal-heading">
            <p className="eyebrow"><span /> {english ? "Let's talk" : "Razgovarajmo"}</p>
            <h2 id="contact-modal-title">
              {english ? <>Send Vlado a <em>short message.</em></> : <>Pošalji Vladi <em>kratku poruku.</em></>}
            </h2>
            <p>{english
              ? "You do not need to enter your email address. We will prepare the message in your email app."
              : "Ne trebaš upisivati svoju e-mail adresu. Pripremit ćemo poruku u tvojoj mail aplikaciji."}</p>
          </div>

          <form className="contact-form" onSubmit={prepareEmail}>
            <label className="contact-field">
              <span>{english ? "Full name" : "Ime i prezime"}</span>
              <input name="name" autoComplete="name" required placeholder={english ? "What is your name?" : "Kako se zoveš?"} />
            </label>

            <label className="contact-field">
              <span>{english ? "Topic" : "Tema"}</span>
              <select name="topic" defaultValue={english ? "I want to get involved" : "Želim se uključiti"}>
                <option>{english ? "I want to get involved" : "Želim se uključiti"}</option>
                <option>{english ? "School collaboration" : "Suradnja sa školom"}</option>
                <option>{english ? "Mentoring or guest visit" : "Mentorstvo ili gostovanje"}</option>
                <option>{english ? "Donation or sponsorship" : "Donacija ili sponzorstvo"}</option>
                <option>{english ? "Other" : "Drugo"}</option>
              </select>
            </label>

            <label className="contact-field contact-field--wide">
              <span>{english ? "Message" : "Poruka"}</span>
              <textarea name="message" required minLength={10} rows={5} placeholder={english ? "Share your idea or a concrete proposal…" : "Napiši ideju ili konkretan prijedlog…"} />
            </label>

            <div className="contact-form-actions">
              <button className="button button--dark" type="submit">{english ? "Prepare email" : "Pripremi e-mail"} <span aria-hidden="true">→</span></button>
              <button className="contact-cancel" type="button" onClick={closeModal}>{english ? "Cancel" : "Odustani"}</button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
