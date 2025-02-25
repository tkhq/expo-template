import { View, Text, ScrollView } from "react-native";
import { useTurnkey } from "@turnkey/sdk-react-native";

const Dashboard = () => {
  const { user } = useTurnkey();

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-bold">Not Logged In</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">User Details</Text>
      
      <Text className="text-base">ID: {user.id}</Text>
      <Text className="text-base">Username: {user.userName}</Text>
      <Text className="text-base">Email: {user.email || "N/A"}</Text>
      <Text className="text-base">Phone: {user.phoneNumber || "N/A"}</Text>
      <Text className="text-base">Organization ID: {user.organizationId}</Text>

      <Text className="text-lg font-bold mt-6">Wallets</Text>
      {user.wallets.length > 0 ? (
        user.wallets.map((wallet) => (
          <View key={wallet.id} className="p-2 border-b border-gray-200">
            <Text className="text-base font-medium">Wallet: {wallet.name}</Text>
            {wallet.accounts.map((account) => (
              <Text key={account.id} className="text-sm">
                - {account.address} ({account.addressFormat})
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text className="text-base">No wallets found</Text>
      )}
    </ScrollView>
  );
};

export default Dashboard;
