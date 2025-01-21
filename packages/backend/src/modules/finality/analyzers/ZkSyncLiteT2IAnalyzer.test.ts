import { ProjectId, UnixTime } from '@l2beat/shared-pure'
import { expect, mockFn, mockObject } from 'earl'

import type { Database } from '@l2beat/database'
import type { RpcClient } from '@l2beat/shared'
import { ZkSyncLiteT2IAnalyzer } from './ZkSyncLiteT2IAnalyzer'

describe(ZkSyncLiteT2IAnalyzer.name, () => {
  describe(ZkSyncLiteT2IAnalyzer.prototype.analyze.name, () => {
    it('should return timestamp differences between l1 and l2 blocks', async () => {
      const TX_HASH =
        '0x9bb45c938921cdbb5cdd46c5221c8964e1181728484b4113bacdfe22e71e46e1'
      const L1_TIMESTAMP = 1800000000
      const L2_TIMESTAMP = 1711364267

      const projectId = ProjectId('zksync')
      const rpcClient = mockObject<RpcClient>({
        getTransaction: mockFn().resolvesTo({
          data: mockBytesResponse,
        }),
      })

      const analyzer = new ZkSyncLiteT2IAnalyzer(
        rpcClient,
        mockObject<Database>(),
        projectId,
      )

      const tx = { txHash: TX_HASH, timestamp: new UnixTime(L1_TIMESTAMP) }
      const previousTx = tx // not used
      const result = await analyzer.analyze(previousTx, tx)

      expect(result).toEqual([{ blockNumber: 435243, timestamp: L2_TIMESTAMP }])
    })
  })
})

/**
 * Slice of actual transcation under hash `0x9bb45c938921cdbb5cdd46c5221c8964e1181728484b4113bacdfe22e71e46e1`
 * For the sake of testing, we only care about the single block, transaction's data has been reduced to.
 * Proof input has been preserved
 *
 * Block preserved: 435243
 * Timestamp of preserved block: 1711364267
 * */
const mockBytesResponse =
  '0x83981808000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000006a42b0000000000000000000000000000000000000000000000000000000000000001c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a47000000000000000000000000000000000000000000000000000000000660158ab156d15fc013ad2935fb9622721d45f690bb226f61113f0b3f5c20e90244a1a718488d1dc49b214eb136ddeb7e335e6d815acfd9b745806d1b1a15779b38faa13000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002c0000000000000000000000000000000000000000000000000000000000000072000000000000000000000000000000000000000000000000000000000000008400000000000000000000000000000000000000000000000094933bebca14812a0000000000000000000000000000000000000000000000003aa9b05ac2ee3bb5d000000000000000000000000000000000000000000000003a654ed3d244f5e1300000000000000000000000000000000000000000000000000003786b9b826120000000000000000000000000000000000000000000000044159a7078937a6830000000000000000000000000000000000000000000000035b5e17161d55734b0000000000000000000000000000000000000000000000004b8a08c5a969d39a00000000000000000000000000000000000000000000000000007335616a30d0000000000000000000000000000000000000000000000007e70a1e8e3e67a11200000000000000000000000000000000000000000000000816dd1a751ebe590700000000000000000000000000000000000000000000000767c51e4986c0b04d000000000000000000000000000000000000000000000000000126e2e0f06ac700000000000000000000000000000000000000000000000a2b83c60bbb5a00c00000000000000000000000000000000000000000000000064310482bdf5761c20000000000000000000000000000000000000000000000085c5a07af4664ca3c0000000000000000000000000000000000000000000000000002b344c4dc5c45000000000000000000000000000000000000000000000000000000000000000100682160a18b75a48dc927dce8e0431651486b55ce444acf78b710c3c9a3b0a3000000000000000000000000000000000000000000000000000000000000002203546665f46a234aa573aee3fbf5738eac533d0416261bc2ed55471f851249d81649a7f23122b56bf20e0b04a848bf1c7de89382203e0dff3b154c7699de615e01d465842e99df1414dc3da0cb942824b4a54089ec117132f88b64b4ed3202360ff4bf0a45ce0c26ed6fa5869b840ca61d52061d20b4fc09f46bc35551d930012f5db8c706ecf698480729eea9e43f5db6aa4dbfbb6b9e826583bc25f66277440cbb8e3639a041a45da022a05e1acf059926aa5fdf05c9d2cce61d8302ec4a9f061cc3af41adc40ddc9a77fdffce3bdb97722c798036d7e01d83c179f8aabfb602ff55fa82a820439ccf61052b395399f21de95178cf371ad847be56a6a9f51f1eb8256fc5aab191a70c48d592fa3ffb1645c7012727b3af137893ff2c4b61e60cf96550815db4ce0220c1d708c2dbc6d5ab21bd31c9f4ac2ac5174109377fcc20a4c60a44a259e6cd1438b0919c1bdfedf5a664d3a95a199083cf54a1fb9564127ba618a9943c507f18b0638bea1983eb85769bd44b0111679fc3a8c24e0e3512e2070b5f7c9155d17684651cae7b22d0317f20d551d4937b275a6ff7c42cc124e09d325b9fdbc1d8d79815c4ed6b5bd293396357b36a0d4add06db3740abda2c0b8e60a55c075461d1997eb09c2f585161b0c9e2b63fdac3b2b68fcda7da4b0132a75820610c0f9fb751a22c01abea6536680146cbf3f3e05046889c81b49f23a21f85b63ce17ed1d346a895dc046db98c1c1afe2b3438f522e9117379b213049779355ef4b02e3c9b819b61699368b02d4d17db3861ef93f5d94eb69a33402e9bf3061eeaf9ea6442296836b054bb93d7f74f45d72942ce1475c8454cb18d170623c25bcf30f589c7bcc47b3b209604ab5173054569ed1ce1eb9b621479a11b41d08e0dd9852948a4fa1f2531b26fe9bacd2b2abb4809c50d61ce82d2e6422ac1faa141f74934c18da127bc144d8047ca34b4d8ef6fe05eee2e150f786a8e20b84ca655609617b3d423a807c16f7116f937e4bca4524d679a6e26863a6ad12cf2bbff50c25716f7a3356a55b081711c30ade54d9a3c444ec30dd0c929b6812a3f29cb52a82755b28660f8533fe408050a1e95f43cb6e60c3d2258f6b32fc820e75fc9ff0423eec657c102d340e3365da34bef5984a8626f0187f34220f6660b7c023445d5c9933c7f8dec7e5cf44d4b5ed7385298c1e8b202c5c9496a10e315628a1b6756e081e73f7454fcf5a32148c051cad32cdcc4a4d7497bda95465c1f8cb86a9afd96298b42b61198a2cb4b098ddc6a05927d5a8ef260d1276291320f32c4eaa911674992d54c119d356e90bb2b6ce833a8bb83199f03d268c7abb6039d80d87a4c2c61f7568edcab27ace94ef83d37a6bd2f290b9b7ca374cb9df618fc568b19dbe7084134a303879ed3b8864cd411ed78c67dad98e410feb6f7ed08cc3d29838646d342625ee48458aa666a131862bffb5a04293c52f1cc6c168129e418ac2e3765ff1f4263a7f087902e5925c29f796153daf763414d93fe816800000000000000000000000000000000000000000000000000000000000000080488d1dc49b214eb136ddeb7e335e6d815acfd9b745806d1b1a15779b38faa131e427e74d8450feff2108e6442811631d678aad930686be015d3796c4ddd033b0215d914bd93172509b5620391e4c5c0682b3967c1ef8e313b69483981ecb8a70a2bfc7159e80070df21353be367f039e1a71851a58b42a4e59a82f582d695781c6b808478f60de7698e097582d0d6996d9af00ea22fe63ae17fffc9d8fb959319f498f083171b01dcf0e82449054b7a0e8e1674194c9754fbeae5871a73176719fdb0dd104466a0e5c7d6d4ce1b62986d436917695184c6fd256034f8d5cabf04800f31f7b2003fc365f2fe7a4834efed0d782a69aa809d8add379b8158e2fc000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003'
