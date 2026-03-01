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
  mdiAlertCircle,
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
  mdiTrashCanOutline,
  mdiCreditCardOutline,
  mdiClose,
  mdiImageEdit,
  mdiImagePlus,
  mdiTrashCan,
  mdiContentSaveEdit,
  mdiFileEdit,
  mdiCheckCircleOutline,
  mdiMenuDown,
  mdiCartArrowDown,
  mdiAlert,
  mdiStarOutline,
  mdiStar,
  mdiStarHalfFull,
  mdiPackageVariantClosed,
  mdiPencilBoxOutline,
  mdiHeart,
  mdiHeartPlusOutline,
  mdiHeartCircleOutline,
  mdiClipboardRemoveOutline,
  mdiClipboardAlertOutline,
  mdiCashRefund,
  mdiClipboardArrowDownOutline,
  mdiMenu
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

const TrashCanOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiTrashCanOutline} size={size} />
);

const CreditCardIcon = ({ size = 1 }) => (
  <Icon path={mdiCreditCardOutline} size={size} />
);

const CloseIcon = ({ size = 1 }) => <Icon path={mdiClose} size={size} />;

const ImageEditIcon = ({ size = 1 }) => (
  <Icon path={mdiImageEdit} size={size} />
);

const ImagePlusIcon = ({ size = 1 }) => (
  <Icon path={mdiImagePlus} size={size} />
);

const TrashCanIcon = ({ size = 1 }) => <Icon path={mdiTrashCan} size={size} />;

const ContentSaveEditIcon = ({ size = 1 }) => (
  <Icon path={mdiContentSaveEdit} size={size} />
);

const FileEditIcon = ({ size = 1 }) => <Icon path={mdiFileEdit} size={size} />;

const SuccessTickIcon = ({ size = 1 }) => (
  <Icon path={mdiCheckCircleOutline} size={size} />
);

const MenuDownIcon = ({ size = 1 }) => <Icon path={mdiMenuDown} size={size} />;

const CartArrowDownIcon = ({ size = 1 }) => (
  <Icon path={mdiCartArrowDown} size={size} />
);

const AlertCircleFilledIcon = ({ size = 1 }) => (
  <Icon path={mdiAlertCircle} size={size} />
);

const AlertTriangleIcon = ({ size = 1 }) => (
  <Icon path={mdiAlert} size={size} />
);

const StarOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiStarOutline} size={size} />
);

const StarIcon = ({ size = 1 }) => <Icon path={mdiStar} size={size} />;

const StarHalfFullIcon = ({ size = 1 }) => (
  <Icon path={mdiStarHalfFull} size={size} />
);

const PackageIcon = ({ size = 1 }) => (
  <Icon path={mdiPackageVariantClosed} size={size} />
);

const PencilBoxOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiPencilBoxOutline} size={size} />
);

const HeartFilledIcon = ({ size = 1 }) => <Icon path={mdiHeart} size={size} />;

const HeartPlusOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiHeartPlusOutline} size={size} />
);

const HeartCircleOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiHeartCircleOutline} size={size} />
);

const ClipboardRemoveOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiClipboardRemoveOutline} size={size} />
);

const ClipboardAlertOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiClipboardAlertOutline} size={size} />
);

const CashRefundIcon = ({ size = 1 }) => (
  <Icon path={mdiCashRefund} size={size} />
);

const ClipboardArrowDownOutlineIcon = ({ size = 1 }) => (
  <Icon path={mdiClipboardArrowDownOutline} size={size} />
);

const MenuIcon = ({ size = 1 }) => <Icon path={mdiMenu} size={size} />;

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
  TrashCanOutlineIcon,
  CreditCardIcon,
  CloseIcon,
  ImageEditIcon,
  ImagePlusIcon,
  TrashCanIcon,
  ContentSaveEditIcon,
  FileEditIcon,
  SuccessTickIcon,
  MenuDownIcon,
  CartArrowDownIcon,
  AlertCircleFilledIcon,
  AlertTriangleIcon,
  StarOutlineIcon,
  StarIcon,
  StarHalfFullIcon,
  PackageIcon,
  PencilBoxOutlineIcon,
  HeartFilledIcon,
  HeartPlusOutlineIcon,
  HeartCircleOutlineIcon,
  ClipboardRemoveOutlineIcon,
  ClipboardAlertOutlineIcon,
  CashRefundIcon,
  ClipboardArrowDownOutlineIcon,
  MenuIcon
};
