import Script from "next/script";
import { getSiteSettings } from "@/lib/settings";

// Hardcoded fallback GA id — left in place so existing measurement
// continues to flow if the admin hasn't filled in the settings row yet.
// Once the settings row has a real `pixel_google_id`, that takes over.
const FALLBACK_GA_ID = "G-VK9XHSB6T6";

/**
 * Render analytics & ad-tracking pixels for the storefront only. Reads the
 * site_settings row so admins can change Meta / TikTok / GA ids without a
 * code deploy. Renders nothing for a given pixel when the id is empty so
 * we don't fire scripts the merchant didn't opt into.
 *
 * Intentionally lives in the storefront layout rather than the root layout
 * — /admin pages don't need (and shouldn't have) marketing pixels.
 */
export default async function StorefrontPixels() {
  const settings = await getSiteSettings();
  const gaId = settings.pixel_google_id?.trim() || FALLBACK_GA_ID;
  const metaId = settings.pixel_meta_id?.trim() || "";
  const tiktokId = settings.pixel_tiktok_id?.trim() || "";

  return (
    <>
      {gaId && (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            }}
          />
        </>
      )}

      {metaId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`,
          }}
        />
      )}

      {tiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokId}');ttq.page();}(window,document,'ttq');`,
          }}
        />
      )}
    </>
  );
}
