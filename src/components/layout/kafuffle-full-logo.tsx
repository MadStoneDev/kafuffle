// /components/ui/kafuffle-logo.tsx
import * as React from "react";

const KafuffleLogo = ({ props }: { props?: React.SVGProps<SVGSVGElement> }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 70 13"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    {...props}
  >
    <path
      d="m21.782 24.172 3.219-1.867 1.458 2.526-2.988 1.725h2.153v5.318h-2.9v-2.437h-.942v2.437h-2.917v-6.403h-.534v-2.882h3.451v1.583ZM30.906 30.896h-1.014l-.089.978h-2.899l.818-9.285h6.101v9.285l-2.917.783v-1.761Zm-.747-2.882h.747v-2.543h-.533l-.214 2.543ZM37.167 27.267h2.881v2.882h-2.881v1.725h-2.899v-9.285h6.99l-.338 3.807h-2.917l.089-.925h-.925v1.796ZM42.432 25.471h-.729v-2.882h3.646v6.404h.907l-.569-6.404h2.917l.818 9.285h-6.99v-6.403ZM52.766 27.267h2.881v2.882h-2.881v1.725h-2.899v-9.285h6.99l-.338 3.807h-2.917l.089-.925h-.925v1.796ZM60.201 27.267h2.881v2.882h-2.881v1.725h-2.899v-9.285h6.99l-.338 3.807h-2.917l.089-.925h-.925v1.796ZM68.472 22.589l-.57 6.404h2.775v2.881h-5.941l.57-6.403h-.463v-2.882h3.629ZM77.65 22.589l-.267 2.882h-3.344v.302h3.308l-.249 2.864h-3.059v.356h3.397v2.881h-6.314v-9.285h6.528Z"
      style={{
        fill: "currentColor",
        fillRule: "nonzero",
      }}
      transform="translate(-21.63 -26.321) scale(1.18007)"
    />
  </svg>
);

export default KafuffleLogo;
