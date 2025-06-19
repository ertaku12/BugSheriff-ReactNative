import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Importing user screens
import HomePage from "./screens/user/HomeScreen";
import LoginPage from "./screens/user/LoginScreen";
import SignupPage from "./screens/user/SignupScreen";
import ForgotPasswordPage from "./screens/user/ForgotPasswordScreen";
import ProfilePage from "./screens/user/ProfileScreen";
import ProgramsPage from "./screens/user/ProgramsScreen";
import ReportsPage from "./screens/user/ReportsScreen";
import ProgramDetail from "./screens/widgets/ProgramDetail";

// Importing admin screens
import AHomePage from "./screens/admin/AHomeScreen";
import AProfilePage from "./screens/admin/AProfileScreen";
import AProgramsPage from "./screens/admin/AProgramsScreen";
import AReportsPage from "./screens/admin/AReportsScreen";
import ProgramDetailPage from "./screens/widgets/AProgramDetail";

import LeftSidebar from "./screens/components/LeftSidebar";
import ALeftSidebar from "./screens/components/ALeftSidebar";


const Drawer = createDrawerNavigator();

// Consolidated screen configurations
const USER_SCREENS = [
	{ name: "Home", component: HomePage },
	{ name: "Login", component: LoginPage },
	{ name: "Signup", component: SignupPage },
	{ name: "Profile", component: ProfilePage },
	{ name: "Programs", component: ProgramsPage },
	{ name: "Reports", component: ReportsPage },
];

const ADMIN_SCREENS = [
	{ name: "Admin's Home", component: AHomePage },
	{ name: "Admin's Login", component: LoginPage },
	{ name: "Admin's Signup", component: SignupPage },
	{ name: "Admin's Profile", component: AProfilePage },
	{ name: "Admin's Programs", component: AProgramsPage },
	{ name: "Admin's Reports", component: AReportsPage },
];

const CustomDrawerContent = (props) => {
	const { state } = props;
	const isAdmin = state.routes[state.index]?.name.startsWith("A");
	const screens = isAdmin ? ADMIN_SCREENS : USER_SCREENS;
	const Sidebar = isAdmin ? ALeftSidebar : LeftSidebar;

	return <Sidebar {...props} screens={screens} />;
};

const AppNavigator = () => {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Drawer.Navigator
				initialRouteName="Home"
				drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#007AFF',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
			>
				{/* User Screens */}
				{USER_SCREENS.map((screen) => (
					<Drawer.Screen
						key={screen.name}
						name={screen.name}
						component={screen.component}
					/>
				))}

				{/* Admin Screens */}
				{ADMIN_SCREENS.map((screen) => (
					<Drawer.Screen
						key={screen.name}
						name={screen.name}
						component={screen.component}
					/>
				))}

				{/* Program Detail (Hidden from sidebar) */}
				<Drawer.Screen
					name="Program Details"
					component={ProgramDetail}
					options={{ drawerItemStyle: { display: "none" } }}
				/>

				{/* Forgot Password (Hidden from sidebar) */}
				<Drawer.Screen
					name="Forgot Password"
					component={ForgotPasswordPage}
					options={{ drawerItemStyle: { display: "none" } }}
				/>

				{/* Admin Program Detail (Hidden from sidebar) */}
				<Drawer.Screen
					name="Admin Program Details"
					component={ProgramDetailPage}
					options={{ drawerItemStyle: { display: "none" } }}
				/>

				{/* Admin Add Program (Hidden from sidebar) */}
				{/* <Drawer.Screen
					name="AddProgram"
					component={AddProgram}
					options={{ drawerItemStyle: { display: "none" } }}
				/> */}
			</Drawer.Navigator>
		</GestureHandlerRootView>
	);
};

export default AppNavigator;