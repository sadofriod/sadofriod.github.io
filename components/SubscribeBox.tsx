'use client';

import T from './T';

const ENDPOINT = 'https://ashesborn.cloud/api/subscribe';

type Props = { source?: string };

/**
 * Newsletter signup at the end of every article.
 *
 * A plain HTML form posting cross-origin to the company Worker: no JS, no
 * fetch, no tracking. The Worker answers with a 303 to /thanks/?t=subscribe.
 * `hp` is a honeypot field — bots fill it, humans never see it.
 */
export default function SubscribeBox({ source = 'blog' }: Props) {
  return (
    <section className="subscribe-box" aria-labelledby="subscribe-box-title">
      <p className="subscribe-box__kicker"><T k="subscribe.kicker" /></p>
      <h2 className="subscribe-box__title" id="subscribe-box-title"><T k="subscribe.title" /></h2>
      <p className="subscribe-box__note"><T k="subscribe.note" /></p>
      <form className="subscribe-box__form" action={ENDPOINT} method="post">
        <input
          className="subscribe-box__input"
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          aria-label="Email"
          autoComplete="email"
        />
        <input
          className="subscribe-box__hp"
          type="text"
          name="hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <input type="hidden" name="source" value={source} />
        <button className="subscribe-box__button" type="submit"><T k="subscribe.cta" /></button>
      </form>
    </section>
  );
}
