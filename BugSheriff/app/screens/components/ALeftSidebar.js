import React from "react";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

const ALeftSidebar = ({ screens, ...props }) => {
  const navigation = useNavigation();

  const screenLabels = {
    "AHome": "Admin Home",
    "Login": "Login",
    "Signup": "Signup",
    "AProfile": "Admin Profile",
    "APrograms": "Admin Programs",
    "AReports": "Admin Reports"
  };

  return (
    <DrawerContentScrollView {...props}>
      {screens.map((screen) => (
        <DrawerItem
          key={screen.name}
          label={screenLabels[screen.name] || screen.name}
          onPress={() => navigation.navigate(screen.name)}
        />
      ))}
    </DrawerContentScrollView>
  );
};

export default ALeftSidebar;