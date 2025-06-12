import { Col, Row, Skeleton } from "antd";

export function ProfileSkeleton() {
  return (
    <Col span={24}>
      {Array.from({ length: 2 }).map((_, index) => {
        return (
          <Row key={index} gutter={[30, 45]} style={{ marginBottom: "100px" }}>
            <Col span={24}>
              <Skeleton
                paragraph={{
                  rows: 1,
                }}
                active
              />
            </Col>

            <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
              <Skeleton.Button active size="large" block />
            </Col>
            <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
              <Skeleton.Button active size="large" block />
            </Col>
            <Col span={24} style={{ marginBottom: "var(--mpr-1)" }}>
              <Skeleton.Image active />
            </Col>
          </Row>
        );
      })}
    </Col>
  );
}
