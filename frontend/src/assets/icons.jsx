import Icon from '@mdi/react';
import { mdiBellOutline, mdiMagnify, mdiHeartOutline,mdiAccountOutline, mdiCartOutline } from '@mdi/js';

const BellIcon = ({size=1}) => <Icon path={mdiBellOutline} size={size} />;
const SearchIcon = ({size=1}) => <Icon path={mdiMagnify} size={size} />;
const HeartIcon = ({size=1}) => <Icon path={mdiHeartOutline} size={size} />;
const AccountIcon = ({size=1}) => <Icon path={mdiAccountOutline} size={size} />;
const CartIcon = ({size=1}) => <Icon path={mdiCartOutline} size={size} />;
export { BellIcon, SearchIcon, HeartIcon, AccountIcon, CartIcon };