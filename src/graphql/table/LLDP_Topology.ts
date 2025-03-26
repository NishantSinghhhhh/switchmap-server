from sqlalchemy import Table, Column, Integer, String, ForeignKey, Index, MetaData

metadata = MetaData()

nodesTable = Table(
    "nodes",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("node_id", String(255), nullable=False, unique=True),
    Index("ix_nodes_node_id", "node_id"),
)

linksTable = Table(
    "links",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("source", String(255), ForeignKey("nodes.node_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False),
    Column("target", String(255), ForeignKey("nodes.node_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False),
    Column("local_port", String(50), nullable=False),
    Column("remote_port", String(50), nullable=False),
    Index("ix_links_source", "source"),
    Index("ix_links_target", "target"),
)
