"use client";

import { FormEvent, MouseEvent, useRef } from "react";

const CONTACT_EMAIL = "bitibolji4@gmail.com";

export function ContactModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
    const topic = String(formData.get("topic") ?? "Suradnja");
    const message = String(formData.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Biti bolji — ${topic}`);
    const body = encodeURIComponent(`Pozdrav Vlado,\n\n${message}\n\n${name}`);

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    closeModal();
  }

  return (
    <>
      <button className="button button--dark contact-button" type="button" onClick={openModal}>
        Pošalji poruku <span aria-hidden="true">→</span>
      </button>

      <dialog
        aria-labelledby="contact-modal-title"
        className="contact-modal"
        onClick={closeOnBackdrop}
        ref={dialogRef}
      >
        <div className="contact-modal-inner">
          <button className="contact-modal-close" type="button" onClick={closeModal} aria-label="Zatvori kontakt obrazac">
            ×
          </button>

          <div className="contact-modal-heading">
            <p className="eyebrow"><span /> Razgovarajmo</p>
            <h2 id="contact-modal-title">Pošalji Vladi <em>kratku poruku.</em></h2>
            <p>Ne trebaš upisivati svoju e-mail adresu. Pripremit ćemo poruku u tvojoj mail aplikaciji.</p>
          </div>

          <form className="contact-form" onSubmit={prepareEmail}>
            <label className="contact-field">
              <span>Ime i prezime</span>
              <input name="name" autoComplete="name" required placeholder="Kako se zoveš?" />
            </label>

            <label className="contact-field">
              <span>Tema</span>
              <select name="topic" defaultValue="Želim se uključiti">
                <option>Želim se uključiti</option>
                <option>Suradnja sa školom</option>
                <option>Mentorstvo ili gostovanje</option>
                <option>Donacija ili sponzorstvo</option>
                <option>Drugo</option>
              </select>
            </label>

            <label className="contact-field contact-field--wide">
              <span>Poruka</span>
              <textarea name="message" required minLength={10} rows={5} placeholder="Napiši ideju ili konkretan prijedlog…" />
            </label>

            <div className="contact-form-actions">
              <button className="button button--dark" type="submit">Pripremi e-mail <span aria-hidden="true">→</span></button>
              <button className="contact-cancel" type="button" onClick={closeModal}>Odustani</button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
