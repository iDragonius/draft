import React, { useState } from "react";

import {
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  EmptyStateLayout,
} from "@strapi/design-system";
import { Illo } from "../../components/Illo";

const HomePage = () => {
  const [otpData, setOtpData] = useState([]);
  return (
    <Layout>
      <BaseHeaderLayout
        title={"Auth"}
        subtitle={"Users login / registration"}
        as={"h2"}
      />
      <ContentLayout>
        {otpData.length === 0 ? (
          <EmptyStateLayout icon={<Illo />} content={"There is no auth"} />
        ) : (
          <p>Count</p>
        )}
      </ContentLayout>
    </Layout>
  );
};

export default HomePage;
