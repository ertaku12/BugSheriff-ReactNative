import React from "react";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

const LeftSidebar = ({ screens, ...props }) => {
  const navigation = useNavigation();

  // Filter out admin-specific screens
  const userScreens = screens.filter(screen => 
    !['AHome', 'AProfile', 'APrograms', 'AReports'].includes(screen.name)
  );

  const screenLabels = {
    "Home": "Home",
    "Login": "Login",
    "Signup": "Signup",
    "Profile": "Profile",
    "Programs": "Programs",
    "Reports": "Reports"
  };

  return (
    <DrawerContentScrollView {...props}>
      {userScreens.map((screen) => (
        <DrawerItem
          key={screen.name}
          label={screenLabels[screen.name] || screen.name}
          onPress={() => navigation.navigate(screen.name)}
        />
      ))}
    </DrawerContentScrollView>
  );
};

export default LeftSidebar;