import { RealtimeDashboard } from '@/components/admin/RealtimeDashboard'
import Layout from '@/components/layout/Layout'

const Admin = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <RealtimeDashboard />
      </div>
    </Layout>
  )
}

export default Admin