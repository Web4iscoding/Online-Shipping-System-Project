import Icon from "@mdi/react";
import {
  mdiBellOutline,
  mdiMagnify,
  mdiHeartOutline,
  mdiAccountOutline,
  mdiCartOutline,
  mdiCartVariant,
  mdiCashMultiple,
  mdiWindowClose,
  mdiAlertCircleOutline,
  mdiShoppingOutline,
  mdiAccountDetails,
  mdiBasketOutline,
  mdiClipboardListOutline,
  mdiSaleOutline,
  mdiTruckCheckOutline,
  mdiStoreEditOutline,
  mdiChevronLeft,
  mdiEye,
  mdiEyeOff,
  mdiPlus,
  mdiChevronRight,
  mdiPageFirst,
  mdiPageLast,
  mdiGoogleDownasaur,
  mdiLoading,
  mdiMinus,
} from "@mdi/js";

const BellIcon = ({ size = 1 }) => <Icon path={mdiBellOutline} size={size} />;
const SearchIcon = ({ size = 1, style }) => (
  <Icon path={mdiMagnify} size={size} style={style} />
);
const HeartIcon = ({ size = 1 }) => <Icon path={mdiHeartOutline} size={size} />;
const AccountIcon = ({ size = 1 }) => (
  <Icon path={mdiAccountOutline} size={size} />
);
const CartIcon = ({ size = 1 }) => <Icon path={mdiCartOutline} size={size} />;
const CartAltIcon = ({ size = 1 }) => (
  <Icon path={mdiCartVariant} size={size} />
);
const CashMultipleIcon = ({ size = 1 }) => (
  <Icon path={mdiCashMultiple} size={size} />
);

const WindowCloseIcon = ({ size = 1 }) => (
  <Icon path={mdiWindowClose} size={size} />
);

const AlertCircleIcon = ({ size = 1 }) => (
  <Icon path={mdiAlertCircleOutline} size={size} />
);

const ShoppingIcon = ({ size = 1 }) => (
  <Icon path={mdiShoppingOutline} size={size} />
);

const AccountDetailsIcon = ({ size = 1 }) => (
  <Icon path={mdiAccountDetails} size={size} />
);

const BasketIcon = ({ size = 1 }) => (
  <Icon path={mdiBasketOutline} size={size} />
);

const ClipboardIcon = ({ size = 1 }) => (
  <Icon path={mdiClipboardListOutline} size={size} />
);

const SaleIcon = ({ size = 1 }) => <Icon path={mdiSaleOutline} size={size} />;

const TruckCheckIcon = ({ size = 1 }) => (
  <Icon path={mdiTruckCheckOutline} size={size} />
);

const StoreEditIcon = ({ size = 1 }) => (
  <Icon path={mdiStoreEditOutline} size={size} />
);

const LeftArrowIcon = ({ size = 1 }) => (
  <Icon path={mdiChevronLeft} size={size} />
);

const EyeIcon = ({ size = 1, style }) => (
  <Icon path={mdiEye} size={size} style={style} />
);

const EyeOffIcon = ({ size = 1, style }) => (
  <Icon path={mdiEyeOff} size={size} style={style} />
);

const PlusIcon = ({ size = 1 }) => <Icon path={mdiPlus} size={size} />;

const MinusIcon = ({ size = 1 }) => <Icon path={mdiMinus} size={size} />;

const RightArrowIcon = ({ size = 1 }) => (
  <Icon path={mdiChevronRight} size={size} />
);

const LastPageArrow = ({ size = 1 }) => <Icon path={mdiPageLast} size={size} />;

const FirstPageArrow = ({ size = 1 }) => (
  <Icon path={mdiPageFirst} size={size} />
);

const DinoIcon = ({ size = 1 }) => (
  <Icon path={mdiGoogleDownasaur} size={size} />
);

const LoadingIcon = ({ size = 1 }) => <Icon path={mdiLoading} size={size} />;

export {
  BellIcon,
  SearchIcon,
  HeartIcon,
  AccountIcon,
  CartIcon,
  CartAltIcon,
  CashMultipleIcon,
  WindowCloseIcon,
  AlertCircleIcon,
  ShoppingIcon,
  AccountDetailsIcon,
  BasketIcon,
  ClipboardIcon,
  SaleIcon,
  TruckCheckIcon,
  StoreEditIcon,
  LeftArrowIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  MinusIcon,
  RightArrowIcon,
  LastPageArrow,
  FirstPageArrow,
  DinoIcon,
  LoadingIcon,
};
